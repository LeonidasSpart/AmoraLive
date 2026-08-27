// backend/src/routes/live.js
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { awardXp } = require('../lib/xp');
const { incrementMissionProgress } = require('../lib/missions');

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
          const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
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
        take: sort === 'trending' || !sort ? Math.min(Number(limit) * 3, 150) : Math.min(Number(limit), 100),
        include: {
          host: {
            select: {
              id: true,
              username: true,
              display_name: true,
              profile_photo: true,
              is_verified: true,
              membership_tier: true
            }
          }
        }
      });

      // Real trending score, not just current viewer count — a room with
      // fewer viewers right now but heavy recent gifting activity should
      // still be able to outrank one that's merely been running longest
      // with a big but static audience. Over-fetch by 3x above and re-sort
      // here since Prisma can't order by a computed expression directly.
      const result = (sort === 'trending' || !sort)
        ? rooms
            .map((r) => ({ ...r, _score: r.viewer_count * 3 + r.gift_count * 2 + r.like_count }))
            .sort((a, b) => b._score - a._score)
            .slice(0, Math.min(Number(limit), 100))
            .map(({ _score, ...r }) => r)
        : rooms;

      res.json(result);
    } catch (e) {
      console.error('Error fetching live rooms:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
              profile_photo: true,
              is_verified: true,
              membership_tier: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  display_name: true,
                  profile_photo: true,
                  is_verified: true,
                  membership_tier: true
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
                  display_name: true,
                  profile_photo: true,
                  is_verified: true,
                  membership_tier: true
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
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
              profile_photo: true,
              is_verified: true,
              membership_tier: true
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

      // Flat XP for starting a stream, capped at 3 successful awards/day
      // (60 / 20) — a separate transaction from room creation so a reward
      // bookkeeping issue can never block the actual "go live" action.
      let xpResult = null;
      try {
        xpResult = await prisma.$transaction((tx) =>
          awardXp(tx, { userId: req.user.id, amount: 20, reason: 'went_live', metadata: { roomId: room.id }, dailyCap: 60 })
        );
        await prisma.$transaction((tx) => incrementMissionProgress(tx, req.user.id, 'streams_started', 1));
      } catch (xpErr) {
        console.error('XP award (went_live) failed:', xpErr.message);
      }
      if (xpResult?.leveledUp) {
        io.to(`user-${req.user.id}`).emit('level-up', { newLevel: xpResult.newLevel, badge: xpResult.newBadge });
      }

      // Notify followers via WebSocket (optional)
      io.to('global').emit('new-room', room);

      res.status(201).json(room);
    } catch (e) {
      console.error('Error creating room:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
              display_name: true,
              profile_photo: true,
              is_verified: true,
              membership_tier: true
            }
          }
        }
      });

      // Broadcast to room via WebSocket
      io.to(`live-${id}`).emit('new-chat', msg);

      res.status(201).json(msg);
    } catch (e) {
      console.error('Error sending chat:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
        select: { id: true, status: true, viewer_count: true, peak_viewer_count: true }
      });
      if (!room || room.status !== 'live') {
        return res.status(400).json({ error: 'Room is not live' });
      }

      // Atomically decide whether this is a genuinely new join, so a
      // duplicate/retried join request can't inflate viewer_count. A
      // pre-read-then-decide approach here would race: two near-
      // simultaneous joins could both read "not yet present" and both
      // increment.
      let isNewJoin = false;
      const reactivated = await prisma.roomParticipant.updateMany({
        where: { room_id: id, user_id: userId, left_at: { not: null } },
        data: { left_at: null }
      });
      if (reactivated.count === 1) {
        isNewJoin = true;
      } else {
        try {
          await prisma.roomParticipant.create({
            data: { room_id: id, user_id: userId, role: 'viewer' }
          });
          isNewJoin = true;
        } catch (createErr) {
          if (createErr.code !== 'P2002') throw createErr;
          // Unique constraint hit: already an active participant, not a new join.
        }
      }

      const participant = await prisma.roomParticipant.findUnique({
        where: { room_id_user_id: { room_id: id, user_id: userId } },
        select: { role: true }
      });

      const updated = isNewJoin
        ? await prisma.liveRoom.update({ where: { id }, data: { viewer_count: { increment: 1 } } })
        : room;

      // viewer_count decreases as people leave, so it can never answer
      // "what was the highest it ever reached" — peak_viewer_count is a
      // separate ratchet that only ever goes up.
      if (updated !== room && updated.viewer_count > (room.peak_viewer_count || 0)) {
        prisma.liveRoom.update({ where: { id }, data: { peak_viewer_count: updated.viewer_count } })
          .catch((err) => console.error('Peak viewer update failed:', err.message));
      }

      // Mission progress only for a genuinely new join by a viewer — not a
      // no-op re-join (already active) and not the host joining their own
      // room (that's tracked separately via 'streams_started').
      if (updated !== room && participant?.role !== 'host') {
        prisma.$transaction((tx) => incrementMissionProgress(tx, userId, 'streams_joined', 1))
          .catch((err) => console.error('Mission progress (streams_joined) failed:', err.message));
      }

      // Broadcast viewer count update
      io.to(`live-${id}`).emit('viewer-count', { count: updated.viewer_count });

      res.json({ success: true, viewer_count: updated.viewer_count });
    } catch (e) {
      console.error('Error joining room:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
        select: { host_id: true, status: true, start_time: true }
      });
      if (!room || room.status !== 'live') {
        return res.status(400).json({ error: 'Room is not live' });
      }

      // Check permissions — skip the role lookup entirely when the
      // requester is already the host (the overwhelmingly common case for
      // this endpoint), so a host ending their own stream never depends on
      // this extra query succeeding.
      let isAdmin = false;
      if (room.host_id !== userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        });
        isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
      }
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

      // Duration-based XP goes to the host regardless of who ended the
      // stream (host or an admin) — capped at 120 XP for any single
      // stream and 300 XP/day total, so rapid start/stop spam can't farm
      // unlimited levels.
      const minutesLive = Math.max(0, Math.round((ended.end_time.getTime() - room.start_time.getTime()) / 60000));
      let xpResult = null;
      if (minutesLive > 0) {
        try {
          xpResult = await prisma.$transaction((tx) =>
            awardXp(tx, {
              userId: room.host_id,
              amount: Math.min(120, minutesLive * 2),
              reason: 'live_duration',
              metadata: { roomId: id, minutesLive },
              dailyCap: 300
            })
          );
          await prisma.$transaction((tx) => incrementMissionProgress(tx, room.host_id, 'live_minutes', minutesLive));
        } catch (xpErr) {
          console.error('XP award (live_duration) failed:', xpErr.message);
        }
      }
      if (xpResult?.leveledUp) {
        io.to(`user-${room.host_id}`).emit('level-up', { newLevel: xpResult.newLevel, badge: xpResult.newBadge });
      }

      // Notify room that it ended
      io.to(`live-${id}`).emit('room-ended', { roomId: id });

      res.json({ success: true, room: ended });
    } catch (e) {
      console.error('Error ending room:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
        select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true }
      });
      const byId = Object.fromEntries(senders.map((u) => [u.id, u]));
      res.json(totals.map((t) => ({ user: byId[t.sender_id], totalCoins: t._sum.coin_cost || 0 })));
    } catch (e) {
      console.error('Error fetching top gifters:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  return router;
};
