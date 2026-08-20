require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const cors = require('cors');
const helmet = require('helmet');

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
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '20mb' }));

// ---------- Socket.io ----------
let io;
if (redisReady && pub && sub) {
  const { createAdapter } = require('@socket.io/redis-adapter');
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*' },
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
const matchRoutes = require('./routes/matches')(prisma);  // <-- NEW

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/live', liveRoutes);
app.use('/gifts', giftRoutes);
app.use('/wallet', walletRoutes);
app.use('/membership', membershipRoutes);
app.use('/store', storeRoutes);
app.use('/events', eventRoutes);
app.use('/admin', adminRoutes);
app.use('/matches', matchRoutes);                         // <-- NEW

// ---------- Root endpoint ----------
app.get('/', (req, res) => {
  res.json({
    name: 'AmoraLive API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/auth', '/users', '/live', '/gifts', '/wallet',
      '/membership', '/store', '/events', '/admin', '/health', '/matches'
    ]
  });
});

// ---------- Health check ----------
app.get('/health', (req, res) => res.send('AmoraLive API running'));

// ---------- Socket.IO handlers ----------
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-live', (roomId) => {
    socket.join(`live-${roomId}`);
    io.to(`live-${roomId}`).emit('viewer-joined', socket.id);
  });

  socket.on('leave-live', (roomId) => {
    socket.leave(`live-${roomId}`);
    io.to(`live-${roomId}`).emit('viewer-left', socket.id);
  });

  socket.on('live-chat', async (data) => {
    const { roomId, userId, message } = data;
    try {
      const msg = await prisma.liveChatMessage.create({
        data: { room_id: roomId, user_id: userId, message }
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 AmoraLive backend on port ${PORT}`));
