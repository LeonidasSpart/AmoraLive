require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const pub = new Redis(process.env.REDIS_URL);
const sub = new Redis(process.env.REDIS_URL);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '20mb' }));

// Socket.io
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*' },
  adapter: createAdapter(pub, sub)
});
app.set('io', io);

// Import all route modules
const authRoutes = require('./routes/auth')(prisma);
const userRoutes = require('./routes/users')(prisma);
const liveRoutes = require('./routes/live')(prisma, io);
const giftRoutes = require('./routes/gifts')(prisma, io);
const walletRoutes = require('./routes/wallet')(prisma);
const membershipRoutes = require('./routes/membership')(prisma);
const storeRoutes = require('./routes/store')(prisma);
const eventRoutes = require('./routes/events')(prisma, io);
const adminRoutes = require('./routes/admin')(prisma);

// Mount routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/live', liveRoutes);
app.use('/gifts', giftRoutes);
app.use('/wallet', walletRoutes);
app.use('/membership', membershipRoutes);
app.use('/store', storeRoutes);
app.use('/events', eventRoutes);
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.send('AmoraLive API running'));

// Socket.IO handlers
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
    const msg = await prisma.liveChatMessage.create({
      data: { room_id: roomId, user_id: userId, message }
    });
    io.to(`live-${roomId}`).emit('new-chat', msg);
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 AmoraLive backend on port ${PORT}`));
