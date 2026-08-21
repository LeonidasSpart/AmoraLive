require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const { WebSocketServer } = require('ws');
const Stripe = require('stripe');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// ---------- Redis with graceful fallback ----------
let pub, sub;
let redisReady = false;

try {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('⚠️ REDIS_URL not set – running without Redis');
  } else {
    pub = new Redis(redisUrl, {
      retryStrategy: (times) => {
        if (times > 5) {
          console.warn('Redis connection failed after 5 retries – falling back to local');
          return null; // stop retrying
        }
        return Math.min(times * 100, 3000);
      }
    });
    sub = new Redis(redisUrl, {
      retryStrategy: (times) => {
        if (times > 5) {
          console.warn('Redis connection failed after 5 retries – falling back to local');
          return null;
        }
        return Math.min(times * 100, 3000);
      }
    });

    // Silence "missing error handler" warnings
    pub.on('error', (err) => console.warn('Redis pub error:', err.message));
    sub.on('error', (err) => console.warn('Redis sub error:', err.message));

    // Mark as ready when connected
    pub.on('connect', () => { redisReady = true; console.log('✅ Redis connected'); });
    sub.on('connect', () => { console.log('✅ Redis sub connected'); });
  }
} catch (e) {
  console.warn('Redis initialization failed – running without Redis:', e.message);
}

// ---------- Middleware ----------
app.use(helmet());
const configuredCorsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedCorsOrigins = configuredCorsOrigins.length
  ? configuredCorsOrigins
  : ['https://amoramatch.one', 'https://www.amoramatch.one'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser/server-to-server requests.
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    if (allowedCorsOrigins.includes(normalizedOrigin)) return callback(null, true);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
console.log('🔐 Auth/CORS configuration loaded for Amora web authentication');

// Stripe requires the raw request body for signature verification. This route
// must be registered before express.json().
app.post('/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Stripe webhook not configured');
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).send('Invalid signature');
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      const purchaseId = session.metadata?.purchaseId;
      if (purchaseId && session.payment_status === 'paid') {
        await prisma.$transaction(async (tx) => {
          const purchase = await tx.purchase.findUnique({ where: { id: purchaseId }, include: { package: true } });
          if (!purchase || purchase.status === 'completed') return;
          const wallet = await tx.wallet.upsert({ where: { user_id: purchase.user_id }, create: { user_id: purchase.user_id }, update: {} });
          const coins = purchase.package.coins_amount + purchase.package.bonus_coins;
          const updated = await tx.wallet.update({ where: { user_id: purchase.user_id }, data: { balance: { increment: coins } } });
          await tx.purchase.update({ where: { id: purchase.id }, data: { status: 'completed', purchase_token: session.id } });
        });
      }

      if (session.mode === 'subscription' && session.subscription && session.metadata?.userId && session.metadata?.tier) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        const endDate = new Date(sub.current_period_end * 1000);
        await prisma.membership.upsert({
          where: { user_id: session.metadata.userId },
          create: {
            user_id: session.metadata.userId, tier: session.metadata.tier,
            start_date: new Date(), end_date: endDate,
            auto_renew: !sub.cancel_at_period_end,
            stripe_subscription_id: sub.id
          },
          update: {
            tier: session.metadata.tier, start_date: new Date(), end_date: endDate,
            auto_renew: !sub.cancel_at_period_end, stripe_subscription_id: sub.id
          }
        });
        await prisma.user.update({ where: { id: session.metadata.userId }, data: { membership_tier: session.metadata.tier } });
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      const tier = sub.metadata?.tier;
      if (userId) {
        const active = ['active', 'trialing', 'past_due'].includes(sub.status);
        if (active) {
          await prisma.membership.upsert({
            where: { user_id: userId },
            create: { user_id: userId, tier: tier || 'premium', start_date: new Date(), end_date: new Date(sub.current_period_end * 1000), auto_renew: !sub.cancel_at_period_end, stripe_subscription_id: sub.id },
            update: { tier: tier || undefined, end_date: new Date(sub.current_period_end * 1000), auto_renew: !sub.cancel_at_period_end, stripe_subscription_id: sub.id }
          });
          await prisma.user.update({ where: { id: userId }, data: { membership_tier: tier || 'premium' } });
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { membership_tier: 'free' } });
        await prisma.membership.updateMany({ where: { user_id: userId }, data: { auto_renew: false, end_date: new Date() } });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing failed:', err);
    res.status(500).send('Webhook processing failed');
  }
});

app.use(express.json({ limit: '20mb' }));

app.use((req, res, next) => {
  // Browsers can preserve a trailing slash from NEXT_PUBLIC_API_URL and produce
  // /\/auth/google/start. Express does not match that path to /auth.
  if (req.url.startsWith('//')) {
    req.url = req.url.replace(/^\/+/, '/');
  }
  next();
});


// ---------- Socket.io ----------
let io;
if (redisReady && pub && sub) {
  const { createAdapter } = require('@socket.io/redis-adapter');
  io = new Server(server, {
    cors: { origin: allowedCorsOrigins, methods: ['GET', 'POST'] },
    adapter: createAdapter(pub, sub)
  });
} else {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*' }
  });
}
app.set('io', io);

// ---------- Routes ----------
const authRoutes = require('./routes/auth')(prisma);
const userRoutes = require('./routes/users')(prisma);
const liveRoutes = require('./routes/live')(prisma, io);
const giftRoutes = require('./routes/gifts')(prisma, io);
const walletRoutes = require('./routes/wallet')(prisma);
const membershipRoutes = require('./routes/membership')(prisma);
const storeRoutes = require('./routes/store')(prisma);
const eventRoutes = require('./routes/events')(prisma, io);
const adminRoutes = require('./routes/admin')(prisma);
const matchRoutes = require('./routes/matches')(prisma);
const messageRoutes = require('./routes/messages')(prisma, io);
const notificationRoutes = require('./routes/notifications')(prisma, io); // <-- NEW

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/live', liveRoutes);
app.use('/gifts', giftRoutes);
app.use('/wallet', walletRoutes);
app.use('/membership', membershipRoutes);
app.use('/store', storeRoutes);
app.use('/events', eventRoutes);
app.use('/admin', adminRoutes);
app.use('/matches', matchRoutes);
app.use('/messages', messageRoutes);
app.use('/notifications', notificationRoutes); // <-- NEW

// ---------- Root endpoint ----------
app.get('/', (req, res) => {
  res.json({
    name: 'AmoraLive API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/auth', '/users', '/live', '/gifts', '/wallet',
      '/membership', '/store', '/events', '/admin', '/health',
      '/matches', '/messages', '/notifications' // <-- added
    ]
  });
});

// ---------- Health check ----------
app.get('/health', (req, res) => res.send('AmoraLive API running'));

// ---------- Socket.IO handlers ----------
io.on('connection', (socket) => {
  console.log('Socket.IO connection:', socket.id);

  socket.use((packet, next) => {
    if (socket.userId || packet[0] === 'authenticate') return next();
    next(new Error('Not authenticated'));
  });

  socket.on('authenticate', async (token, ack) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, is_active: true } });
      if (!user?.is_active) throw new Error('Account unavailable');
      socket.userId = user.id;
      socket.join(`user-${user.id}`);
      if (typeof ack === 'function') ack({ ok: true });
    } catch (e) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Unauthorized' });
      socket.disconnect(true);
    }
  });

  // Live room events
  socket.on('join-live', (roomId) => {
    socket.join(`live-${roomId}`);
    io.to(`live-${roomId}`).emit('viewer-joined', socket.id);
  });

  socket.on('leave-live', (roomId) => {
    socket.leave(`live-${roomId}`);
    io.to(`live-${roomId}`).emit('viewer-left', socket.id);
  });

  socket.on('live-chat', async (data) => {
    const { roomId, message } = data;
    const userId = socket.userId;
    if (!userId || !roomId || !String(message || '').trim()) return;
    try {
      const msg = await prisma.liveChatMessage.create({
        data: { room_id: roomId, user_id: userId, message: String(message).trim() }
      });
      io.to(`live-${roomId}`).emit('new-chat', msg);
    } catch (err) {
      console.error('Chat error:', err);
    }
  });

  socket.on('gift-sent', (data) => {
    io.to(`live-${data.roomId}`).emit('gift-animation', data);
  });

  socket.on('video-match-signal', (data) => {
    io.to(data.targetId).emit('video-signal', data);
  });

  // Private chat events
  socket.on('private-message', async (data) => {
    const { receiverId, content, type = 'text', media_urls = [] } = data;
    const senderId = socket.userId;
    if (!senderId) {
      console.warn('private-message: sender not authenticated');
      return;
    }
    try {
      const message = await prisma.message.create({
        data: {
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          type,
          media_urls
        },
        include: {
          sender: {
            select: { id: true, username: true, display_name: true, profile_photo: true }
          }
        }
      });
      io.to(`user-${receiverId}`).emit('private-message', message);
      socket.emit('private-message-sent', message);
    } catch (err) {
      console.error('Socket private message error:', err);
    }
  });

  socket.on('typing', ({ receiverId, isTyping }) => {
    const senderId = socket.userId;
    if (!senderId) return;
    io.to(`user-${receiverId}`).emit('typing', { from: senderId, isTyping });
  });

  socket.on('mark-read', async ({ senderId }) => {
    const userId = socket.userId;
    if (!userId) return;
    try {
      await prisma.message.updateMany({
        where: {
          sender_id: senderId,
          receiver_id: userId,
          read_at: null
        },
        data: { read_at: new Date() }
      });
      io.to(`user-${senderId}`).emit('read-receipt', { from: userId });
    } catch (err) {
      console.error('Mark read error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ---------- Native WebSocket bridge (keeps the existing web client compatible) ----------
// This is intentionally separate from Socket.IO. It authenticates with a JWT
// in the first message and supports only the realtime operations needed by the
// current web client. New clients should prefer Socket.IO.
const wsServer = new WebSocketServer({ noServer: true });
const wsUsers = new Map();
const wsRooms = new Map();

function wsBroadcast(set, payload) {
  const body = JSON.stringify(payload);
  for (const client of set || []) {
    if (client.readyState === 1) client.send(body);
  }
}

wsServer.on('connection', (ws) => {
  let userId = null;
  const rooms = new Set();
  ws.authenticated = false;

  ws.on('message', async (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch { return; }

    if (data.type === 'authenticate') {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { id: true, is_active: true } });
        if (!user?.is_active) throw new Error('Unauthorized');
        userId = user.id;
        ws.authenticated = true;
        if (!wsUsers.has(userId)) wsUsers.set(userId, new Set());
        wsUsers.get(userId).add(ws);
        ws.send(JSON.stringify({ type: 'authenticated', userId }));
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Unauthorized' }));
        ws.close(1008, 'Unauthorized');
      }
      return;
    }

    if (!ws.authenticated) return ws.close(1008, 'Authenticate first');

    if (data.type === 'join' || data.type === 'join-live') {
      const roomId = data.roomId;
      if (!roomId) return;
      const room = await prisma.liveRoom.findUnique({ where: { id: roomId }, select: { id: true, status: true, viewer_count: true } });
      if (!room || room.status !== 'live') return ws.send(JSON.stringify({ type: 'error', error: 'Room is not live' }));
      if (!wsRooms.has(roomId)) wsRooms.set(roomId, new Set());
      wsRooms.get(roomId).add(ws);
      rooms.add(roomId);
      const count = wsRooms.get(roomId).size;
      wsBroadcast(wsRooms.get(roomId), { type: 'viewer-count', count });
      return;
    }

    if (data.type === 'leave' || data.type === 'leave-live') {
      const roomId = data.roomId;
      if (!roomId) return;
      const set = wsRooms.get(roomId);
      if (set) {
        set.delete(ws);
        rooms.delete(roomId);
        wsBroadcast(set, { type: 'viewer-count', count: set.size });
        if (!set.size) wsRooms.delete(roomId);
      }
      return;
    }

    if (data.type === 'live-chat') {
      if (!data.roomId || !String(data.message || '').trim()) return;
      const msg = await prisma.liveChatMessage.create({
        data: { room_id: data.roomId, user_id: userId, message: String(data.message).trim() },
        include: { user: { select: { username: true, display_name: true, profile_photo: true } } }
      });
      wsBroadcast(wsRooms.get(data.roomId), { type: 'new-chat', message: msg });
      return;
    }

    if (data.type === 'private-message') {
      if (!data.receiverId || !String(data.content || '').trim()) return;
      const msg = await prisma.message.create({
        data: { sender_id: userId, receiver_id: data.receiverId, content: String(data.content).trim(), type: data.messageType || 'text' },
        include: { sender: { select: { id: true, username: true, display_name: true, profile_photo: true } } }
      });
      wsBroadcast(wsUsers.get(data.receiverId), { type: 'private-message', message: msg });
      ws.send(JSON.stringify({ type: 'private-message-sent', message: msg }));
      return;
    }

    if (data.type === 'typing') {
      wsBroadcast(wsUsers.get(data.receiverId), { type: 'typing', from: userId, isTyping: Boolean(data.isTyping) });
      return;
    }

    if (data.type === 'mark-read') {
      await prisma.message.updateMany({ where: { sender_id: data.senderId, receiver_id: userId, read_at: null }, data: { read_at: new Date() } });
      wsBroadcast(wsUsers.get(data.senderId), { type: 'read-receipt', from: userId });
    }
  });

  ws.on('close', () => {
    for (const roomId of rooms) {
      const set = wsRooms.get(roomId);
      if (!set) continue;
      set.delete(ws);
      wsBroadcast(set, { type: 'viewer-count', count: set.size });
      if (!set.size) wsRooms.delete(roomId);
    }
    if (userId && wsUsers.has(userId)) {
      wsUsers.get(userId).delete(ws);
      if (!wsUsers.get(userId).size) wsUsers.delete(userId);
    }
  });
});

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  if (pathname !== '/ws') return;
  wsServer.handleUpgrade(request, socket, head, (ws) => wsServer.emit('connection', ws, request));
});

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 AmoraLive backend on port ${PORT}`));
