// backend/src/routes/creatorStudio.js
//
// Every number here is aggregated server-side from data that already
// exists (LiveRoom, GiftTransaction, Follow, PkBattle, XpTransaction) — no
// new tracking mechanism invented beyond peak_viewer_count (see schema),
// which viewer_count alone can never answer since it decreases as people
// leave.

const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // ---------- GET /creator-studio/overview ----------
  router.get('/overview', auth, async (req, res) => {
    const userId = req.user.id;
    try {
      const weekAgo = new Date(Date.now() - 7 * 86400000);

      const [
        user,
        totalFollowers,
        newFollowers,
        endedStreams,
        peakAgg,
        totalGiftsReceived,
        giftRows
      ] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { xp: true, level: true, badges: true, membership_tier: true } }),
        prisma.follow.count({ where: { following_id: userId, follower: { deleted_at: null } } }),
        prisma.follow.count({ where: { following_id: userId, created_at: { gte: weekAgo }, follower: { deleted_at: null } } }),
        prisma.liveRoom.findMany({ where: { host_id: userId, status: 'ended' }, select: { start_time: true, end_time: true } }),
        prisma.liveRoom.aggregate({ where: { host_id: userId }, _max: { peak_viewer_count: true } }),
        prisma.giftTransaction.count({ where: { receiver_id: userId, status: 'completed' } }),
        prisma.giftTransaction.findMany({ where: { receiver_id: userId, status: 'completed' }, select: { coin_cost: true, platform_share: true } })
      ]);

      const totalLiveMinutes = endedStreams.reduce((sum, r) => {
        if (!r.end_time) return sum;
        return sum + Math.max(0, Math.round((r.end_time.getTime() - r.start_time.getTime()) / 60000));
      }, 0);

      const totalEarnings = giftRows.reduce((sum, g) => sum + Math.floor(g.coin_cost * (1 - g.platform_share)), 0);

      res.json({
        totalFollowers,
        newFollowersThisWeek: newFollowers,
        totalStreams: endedStreams.length,
        totalLiveMinutes,
        peakViewers: peakAgg._max.peak_viewer_count || 0,
        totalGiftsReceived,
        totalEarnings,
        xp: user?.xp || 0,
        level: user?.level || 0,
        badges: user?.badges || [],
        membershipTier: user?.membership_tier || 'free'
      });
    } catch (e) {
      console.error('Creator studio overview error:', e);
      res.status(500).json({ error: 'Unable to load creator overview', code: 'OVERVIEW_LOAD_FAILED' });
    }
  });

  // ---------- GET /creator-studio/top-supporters ----------
  // Same idea as /live/:id/top-gifters but across every room and every
  // direct gift this creator has ever received, not just one stream.
  router.get('/top-supporters', auth, async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    try {
      const totals = await prisma.giftTransaction.groupBy({
        by: ['sender_id'],
        where: { receiver_id: req.user.id, status: 'completed' },
        _sum: { coin_cost: true },
        orderBy: { _sum: { coin_cost: 'desc' } },
        take: limit
      });
      const senders = await prisma.user.findMany({
        where: { id: { in: totals.map((t) => t.sender_id) } },
        select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true }
      });
      const byId = Object.fromEntries(senders.map((u) => [u.id, u]));
      res.json(totals.map((t) => ({ user: byId[t.sender_id], totalCoins: t._sum.coin_cost || 0 })));
    } catch (e) {
      console.error('Top supporters error:', e);
      res.status(500).json({ error: 'Unable to load top supporters', code: 'SUPPORTERS_LOAD_FAILED' });
    }
  });

  // ---------- GET /creator-studio/analytics?days=7|30|90 ----------
  // Daily-bucketed performance. The frontend decides how to present a
  // 7-day vs 30-day vs 90-day range as "daily/weekly/monthly performance"
  // — the underlying data is always per-day, which is both simpler to
  // reason about and more flexible than pre-aggregating three different
  // ways server-side.
  router.get('/analytics', auth, async (req, res) => {
    const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const since = new Date(Date.now() - days * 86400000);
    since.setUTCHours(0, 0, 0, 0);
    const userId = req.user.id;

    try {
      const [streams, gifts, follows] = await Promise.all([
        prisma.liveRoom.findMany({
          where: { host_id: userId, start_time: { gte: since } },
          select: { start_time: true, end_time: true, viewer_count: true, peak_viewer_count: true }
        }),
        prisma.giftTransaction.findMany({
          where: { receiver_id: userId, status: 'completed', created_at: { gte: since } },
          select: { created_at: true, coin_cost: true, platform_share: true }
        }),
        prisma.follow.findMany({
          where: { following_id: userId, created_at: { gte: since } },
          select: { created_at: true }
        })
      ]);

      const buckets = {};
      const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
      for (let i = 0; i < days; i++) {
        const key = dayKey(new Date(since.getTime() + i * 86400000));
        buckets[key] = { date: key, streams: 0, liveMinutes: 0, giftsReceived: 0, coinsEarned: 0, newFollowers: 0, peakViewers: 0 };
      }

      for (const s of streams) {
        const key = dayKey(s.start_time);
        if (!buckets[key]) continue;
        buckets[key].streams++;
        if (s.end_time) buckets[key].liveMinutes += Math.max(0, Math.round((s.end_time.getTime() - s.start_time.getTime()) / 60000));
        buckets[key].peakViewers = Math.max(buckets[key].peakViewers, s.peak_viewer_count || 0);
      }
      for (const g of gifts) {
        const key = dayKey(g.created_at);
        if (!buckets[key]) continue;
        buckets[key].giftsReceived++;
        buckets[key].coinsEarned += Math.floor(g.coin_cost * (1 - g.platform_share));
      }
      for (const f of follows) {
        const key = dayKey(f.created_at);
        if (!buckets[key]) continue;
        buckets[key].newFollowers++;
      }

      res.json(Object.values(buckets).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (e) {
      console.error('Creator analytics error:', e);
      res.status(500).json({ error: 'Unable to load analytics', code: 'ANALYTICS_LOAD_FAILED' });
    }
  });

  // ---------- GET /creator-studio/streams ----------
  router.get('/streams', auth, async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    try {
      const streams = await prisma.liveRoom.findMany({
        where: { host_id: req.user.id, status: 'ended' },
        orderBy: { start_time: 'desc' },
        take: limit,
        select: {
          id: true, title: true, category: true, start_time: true, end_time: true,
          viewer_count: true, peak_viewer_count: true, gift_count: true, like_count: true
        }
      });
      res.json(streams.map((s) => ({
        ...s,
        durationMinutes: s.end_time ? Math.max(0, Math.round((s.end_time.getTime() - s.start_time.getTime()) / 60000)) : null
      })));
    } catch (e) {
      console.error('Stream history error:', e);
      res.status(500).json({ error: 'Unable to load stream history', code: 'STREAMS_LOAD_FAILED' });
    }
  });

  // ---------- GET /creator-studio/battles ----------
  router.get('/battles', auth, async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    try {
      const myRooms = await prisma.liveRoom.findMany({ where: { host_id: req.user.id }, select: { id: true } });
      const roomIds = myRooms.map((r) => r.id);
      if (roomIds.length === 0) return res.json({ battles: [], wins: 0, losses: 0, draws: 0 });

      const battles = await prisma.pkBattle.findMany({
        where: { status: 'ended', OR: [{ room_a_id: { in: roomIds } }, { room_b_id: { in: roomIds } }] },
        orderBy: { started_at: 'desc' },
        take: limit
      });

      let wins = 0, losses = 0, draws = 0;
      const allEnded = await prisma.pkBattle.findMany({
        where: { status: 'ended', OR: [{ room_a_id: { in: roomIds } }, { room_b_id: { in: roomIds } }] },
        select: { room_a_id: true, room_b_id: true, winner_room_id: true }
      });
      for (const b of allEnded) {
        const myRoomInBattle = roomIds.includes(b.room_a_id) ? b.room_a_id : b.room_b_id;
        if (!b.winner_room_id) draws++;
        else if (b.winner_room_id === myRoomInBattle) wins++;
        else losses++;
      }

      res.json({
        battles: battles.map((b) => ({
          id: b.id,
          startedAt: b.started_at,
          endedAt: b.ended_at,
          myScore: roomIds.includes(b.room_a_id) ? b.score_a : b.score_b,
          opponentScore: roomIds.includes(b.room_a_id) ? b.score_b : b.score_a,
          won: b.winner_room_id ? (roomIds.includes(b.room_a_id) ? b.winner_room_id === b.room_a_id : b.winner_room_id === b.room_b_id) : null
        })),
        wins,
        losses,
        draws
      });
    } catch (e) {
      console.error('Battle history error:', e);
      res.status(500).json({ error: 'Unable to load battle history', code: 'BATTLES_LOAD_FAILED' });
    }
  });

  return router;
};
