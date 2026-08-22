// backend/src/routes/live.js
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

module.exports = (prisma, io) => {
  const router = require('express').Router();

  // ---------- GET /live?sort=trending&category=Music&following=true&limit=20 ----------
  router.get('/', async (req, res) => {
    try {
      const { sort, category, following, limit = 30 } = req.query;
      const where = { status: 'live' };

      // Filter by category
      if (category) {
        where.category = category;
      }

      // Filter by "following" – requires authenticated user
      if (following === 'true') {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
          return res.status(401).json({ error: 'Authentication required for following' });
        }
        // Verify token and get user ID
        const jwt = require('jsonwebtoken');
        let userId;
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch (e) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        // Get users that this user follows
        const followed = await prisma.follow.findMany({
          where: { follower_id: userId },
          select: { following_id: true }
        });
        const followedIds = followed.map(f => f.following_id);
        where.host_id = { in: followedIds };
      }

      // Build orderBy
      let orderBy = { viewer_count: 'desc' };
      if (sort === 'newest') {
        orderBy = { created_at: 'desc' };
      } else if (sort === 'oldest') {
        orderBy = { created_at: 'asc' };
      } else {
        // default: trending by viewer count
        orderBy = { viewer_count: 'desc' };
      }

      const rooms = await prisma.liveRoom.findMany({
        where,
        orderBy,
        take: Math.min(Number(limit), 100),
        include: {
          host: {
            select: {
              id: true,
              username: true,
              display_name: true,
              profile_photo: true
            }
          }
        }
      });

      res.json(rooms);
    } catch (e) {
      console.error('Error fetching live rooms:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- GET /live/:id ----------
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const room = await prisma.liveRoom.findUnique({
        where: { id },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              display_name: true,
              profile_photo: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  display_name: true,
                  profile_photo: true
                }
              }
            },
            where: { left_at: null }
          },
          messages: {
            orderBy: { created_at: 'asc' },
            take: 50,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  display_name: true
                }
              }
            }
          }
        }
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // Get gift count separately if needed
      const giftCount = await prisma.giftTransaction.count({
        where: { room_id: id, status: 'completed' }
      });

      res.json({
        ...room,
        gift_count: giftCount
      });
    } catch (e) {
      console.error('Error fetching room:', e);
      res.status(500).json({ error: e.message });
    }
  });


  // GET /live/:id/token – LiveKit access token for host/viewer. Requires LiveKit env vars.
  router.get('/:id/token', auth, async (req, res) => {
    try {
      const { id } = req.params;
      if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_URL) {
        return res.status(503).json({ error: 'Live video provider is not configured' });
      }
      const room = await prisma.liveRoom.findUnique({ where: { id }, select: { id: true, host_id: true, status: true } });
      if (!room || room.status !== 'live') return res.status(404).json({ error: 'Live room is not active' });
      const isHost = room.host_id === req.user.id;
      const token = jwt.sign({
        iss: process.env.LIVEKIT_API_KEY,
        sub: req.user.id,
        name: req.user.id,
        video: { roomJoin: true, room: id, canPublish: isHost, canSubscribe: true, canPublishData: true }
      }, process.env.LIVEKIT_API_SECRET, { expiresIn: '2h' });
      res.json({ token, url: process.env.LIVEKIT_URL, roomId: id, role: isHost ? 'host' : 'viewer' });
    } catch (e) {
      console.error('Live token error:', e);
      res.status(500).json({ error: 'Unable to create live token' });
    }
  });

  // ---------- POST /live (create room) ----------
  router.post('/', auth, async (req, res) => {
    try {
      const { title, category, thumbnail_url } = req.body;
      if (!title || !category) {
        return res.status(400).json({ error: 'Title and category are required' });
      }

      const room = await prisma.liveRoom.create({
        data: {
          host_id: req.user.id,
          title,
          category,
          thumbnail_url: thumbnail_url || null,
          stream_key: 'stream_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
        },
        include: {
          host: {
            select: {
              id: true,
              username: true,
              display_name: true,
              profile_photo: true
            }
          }
        }
      });

      // Add host as participant
      await prisma.roomParticipant.create({
        data: {
          room_id: room.id,
          user_id: req.user.id,
          role: 'host'
        }
      });

      // Notify followers via WebSocket (optional)
      io.to('global').emit('new-room', room);

      res.status(201).json(room);
    } catch (e) {
      console.error('Error creating room:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /live/:id/chat ----------
  router.post('/:id/chat', auth, async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }

      // Check if room exists and is live
      const room = await prisma.liveRoom.findUnique({
        where: { id },
        select: { status: true }
      });
      if (!room || room.status !== 'live') {
        return res.status(400).json({ error: 'Room is not live' });
      }

      // Create message
      const msg = await prisma.liveChatMessage.create({
        data: {
          room_id: id,
          user_id: req.user.id,
          message: message.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              display_name: true
            }
          }
        }
      });

      // Broadcast to room via WebSocket
      io.to(`live-${id}`).emit('new-chat', msg);

      res.status(201).json(msg);
    } catch (e) {
      console.error('Error sending chat:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /live/:id/join ----------
  router.post('/:id/join', auth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if room exists
      const room = await prisma.liveRoom.findUnique({
        where: { id },
        select: { id: true, status: true, viewer_count: true }
      });
      if (!room || room.status !== 'live') {
        return res.status(400).json({ error: 'Room is not live' });
      }

      const participant = await prisma.roomParticipant.findUnique({
        where: { room_id_user_id: { room_id: id, user_id: userId } }
      });

      await prisma.roomParticipant.upsert({
        where: { room_id_user_id: { room_id: id, user_id: userId } },
        update: { left_at: null, role: participant?.role === 'host' ? 'host' : 'viewer' },
        create: { room_id: id, user_id: userId, role: 'viewer' }
      });

      const updated = participant?.left_at === null
        ? room
        : await prisma.liveRoom.update({ where: { id }, data: { viewer_count: { increment: 1 } } });

      // Broadcast viewer count update
      io.to(`live-${id}`).emit('viewer-count', { count: updated.viewer_count });

      res.json({ success: true, viewer_count: updated.viewer_count });
    } catch (e) {
      console.error('Error joining room:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /live/:id/leave ----------
  router.post('/:id/leave', auth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const participant = await prisma.roomParticipant.findUnique({
        where: { room_id_user_id: { room_id: id, user_id: userId } }
      });
      if (!participant || participant.left_at) {
        const current = await prisma.liveRoom.findUnique({ where: { id }, select: { viewer_count: true } });
        return res.json({ success: true, viewer_count: Math.max(current?.viewer_count || 0, 0) });
      }

      await prisma.roomParticipant.update({
        where: { room_id_user_id: { room_id: id, user_id: userId } },
        data: { left_at: new Date() }
      });

      const updated = await prisma.liveRoom.update({
        where: { id },
        data: { viewer_count: { decrement: 1 } }
      });
      if (updated.viewer_count < 0) {
        await prisma.liveRoom.update({ where: { id }, data: { viewer_count: 0 } });
      }

      io.to(`live-${id}`).emit('viewer-count', { count: updated.viewer_count });

      res.json({ success: true, viewer_count: updated.viewer_count });
    } catch (e) {
      console.error('Error leaving room:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /live/:id/end (host or admin) ----------
  router.post('/:id/end', auth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if user is host or admin
      const room = await prisma.liveRoom.findUnique({
        where: { id },
        select: { host_id: true, status: true }
      });
      if (!room || room.status !== 'live') {
        return res.status(400).json({ error: 'Room is not live' });
      }

      // Check permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
      if (room.host_id !== userId && !isAdmin) {
        return res.status(403).json({ error: 'Only host or admin can end this room' });
      }

      // End room
      const ended = await prisma.liveRoom.update({
        where: { id },
        data: {
          status: 'ended',
          end_time: new Date()
        }
      });

      // Notify room that it ended
      io.to(`live-${id}`).emit('room-ended', { roomId: id });

      res.json({ success: true, room: ended });
    } catch (e) {
      console.error('Error ending room:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- GET /live/:id/top-gifters ----------
  // Powers the in-room leaderboard panel: who has sent the most this
  // stream, distinct from the global team-battle event leaderboard.
  router.get('/:id/top-gifters', async (req, res) => {
    try {
      const { id } = req.params;
      const totals = await prisma.giftTransaction.groupBy({
        by: ['sender_id'],
        where: { room_id: id, status: 'completed' },
        _sum: { coin_cost: true },
        orderBy: { _sum: { coin_cost: 'desc' } },
        take: 10
      });
      const senders = await prisma.user.findMany({
        where: { id: { in: totals.map((t) => t.sender_id) } },
        select: { id: true, username: true, display_name: true, profile_photo: true }
      });
      const byId = Object.fromEntries(senders.map((u) => [u.id, u]));
      res.json(totals.map((t) => ({ user: byId[t.sender_id], totalCoins: t._sum.coin_cost || 0 })));
    } catch (e) {
      console.error('Error fetching top gifters:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
