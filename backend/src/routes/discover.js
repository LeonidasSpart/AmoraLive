// backend/src/routes/discover.js
//
// live.js already handles the basic "list live rooms" case (trending sort,
// category filter, following filter) — this file adds what Discover 2.0
// actually needed that didn't exist at all: search, browsing creators as
// people rather than only their current live rooms, and a first pass at
// real personalization instead of just re-showing the trending sort under
// a different tab name.

const auth = require('../middleware/auth');

const publicCreatorSelect = {
  id: true, username: true, display_name: true, profile_photo: true,
  bio: true, is_verified: true, membership_tier: true, level: true, created_at: true
};

// Every creator card the frontend renders needs to know whether the
// current viewer already follows them — without this, every card just
// silently defaults to showing "Follow" regardless of actual state,
// which is exactly what was happening before this existed.
async function attachFollowStatus(prisma, viewerId, creators) {
  if (creators.length === 0) return creators;
  const following = await prisma.follow.findMany({
    where: { follower_id: viewerId, following_id: { in: creators.map((c) => c.id) } },
    select: { following_id: true }
  });
  const followingSet = new Set(following.map((f) => f.following_id));
  return creators.map((c) => ({ ...c, isFollowing: followingSet.has(c.id) }));
}

module.exports = (prisma) => {
  const router = require('express').Router();

  // ---------- GET /discover/search?q=... ----------
  // Searches both live rooms (by title) and creators (by username/display
  // name) in parallel, since a person typing a name doesn't know in
  // advance whether that creator happens to be live right now.
  router.get('/search', auth, async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ rooms: [], creators: [] });

    try {
      const [rooms, creators] = await Promise.all([
        prisma.liveRoom.findMany({
          where: { status: 'live', title: { contains: q, mode: 'insensitive' } },
          take: 15,
          orderBy: { viewer_count: 'desc' },
          include: { host: { select: publicCreatorSelect } }
        }),
        prisma.user.findMany({
          where: {
            is_active: true,
            id: { not: req.user.id },
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { display_name: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 15,
          select: publicCreatorSelect
        })
      ]);
      res.json({ rooms, creators: await attachFollowStatus(prisma, req.user.id, creators) });
    } catch (e) {
      console.error('Discover search error:', e);
      res.status(500).json({ error: 'Search failed', code: 'SEARCH_FAILED' });
    }
  });

  // ---------- GET /discover/creators?type=new|popular|rising ----------
  router.get('/creators', auth, async (req, res) => {
    const type = ['new', 'popular', 'rising'].includes(req.query.type) ? req.query.type : 'popular';
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    try {
      if (type === 'new') {
        const creators = await prisma.user.findMany({
          where: { is_active: true, id: { not: req.user.id } },
          orderBy: { created_at: 'desc' },
          take: limit,
          select: publicCreatorSelect
        });
        return res.json(await attachFollowStatus(prisma, req.user.id, creators));
      }

      if (type === 'rising') {
        // "Rising" = most new followers gained in the last 7 days — a
        // genuinely different signal from total follower count, since it
        // surfaces creators currently gaining momentum rather than just
        // whoever has been around longest.
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const grouped = await prisma.follow.groupBy({
          by: ['following_id'],
          where: { created_at: { gte: weekAgo }, follower: { deleted_at: null } },
          _count: { following_id: true },
          orderBy: { _count: { following_id: 'desc' } },
          take: limit
        });
        const creators = await prisma.user.findMany({
          where: { id: { in: grouped.map((g) => g.following_id) }, is_active: true },
          select: publicCreatorSelect
        });
        const byId = Object.fromEntries(creators.map((c) => [c.id, c]));
        const shaped = grouped.map((g) => byId[g.following_id]).filter(Boolean).map((c, i) => ({ ...c, newFollowersThisWeek: grouped[i]?._count.following_id || 0 }));
        return res.json(await attachFollowStatus(prisma, req.user.id, shaped));
      }

      // popular = highest all-time follower count
      const grouped = await prisma.follow.groupBy({
        by: ['following_id'],
        where: { follower: { deleted_at: null } },
        _count: { following_id: true },
        orderBy: { _count: { following_id: 'desc' } },
        take: limit
      });
      const creators = await prisma.user.findMany({
        where: { id: { in: grouped.map((g) => g.following_id) }, is_active: true },
        select: publicCreatorSelect
      });
      const byId = Object.fromEntries(creators.map((c) => [c.id, c]));
      const shaped = grouped.map((g) => ({ ...byId[g.following_id], followerCount: g._count.following_id })).filter((c) => c.id);
      res.json(await attachFollowStatus(prisma, req.user.id, shaped));
    } catch (e) {
      console.error('Creator discovery error:', e);
      res.status(500).json({ error: 'Unable to load creators', code: 'CREATORS_LOAD_FAILED' });
    }
  });

  // ---------- GET /discover/recommended ----------
  // First real pass at personalization: rank the categories this person
  // already engages with (from streams they've joined + creators they
  // follow), then show live rooms in those categories they aren't already
  // following, ranked by the same trending score as the main feed. Falls
  // back to plain trending for a brand-new account with no signal yet.
  router.get('/recommended', auth, async (req, res) => {
    const userId = req.user.id;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    try {
      const [joinedRooms, following] = await Promise.all([
        prisma.roomParticipant.findMany({
          where: { user_id: userId },
          select: { room: { select: { category: true } } },
          take: 100,
          orderBy: { joined_at: 'desc' }
        }),
        prisma.follow.findMany({ where: { follower_id: userId }, select: { following_id: true } })
      ]);

      const categoryWeight = {};
      for (const jr of joinedRooms) {
        const cat = jr.room?.category;
        if (cat) categoryWeight[cat] = (categoryWeight[cat] || 0) + 1;
      }
      const preferredCategories = Object.entries(categoryWeight).sort((a, b) => b[1] - a[1]).map(([cat]) => cat);
      const followingIds = following.map((f) => f.following_id);

      const where = {
        status: 'live',
        host_id: { notIn: [...followingIds, userId] },
        ...(preferredCategories.length > 0 ? { category: { in: preferredCategories.slice(0, 3) } } : {})
      };

      let rooms = await prisma.liveRoom.findMany({
        where,
        take: limit,
        include: { host: { select: publicCreatorSelect } }
      });

      // Not enough signal yet (new account, or too few live rooms match
      // their preferred categories) — top up with general trending so the
      // page is never sparse.
      if (rooms.length < limit) {
        const fillerRooms = await prisma.liveRoom.findMany({
          where: { status: 'live', id: { notIn: rooms.map((r) => r.id) }, host_id: { not: userId } },
          orderBy: { viewer_count: 'desc' },
          take: limit - rooms.length,
          include: { host: { select: publicCreatorSelect } }
        });
        rooms = [...rooms, ...fillerRooms];
      }

      // Real trending score: viewers weighted heaviest, but gifts and
      // likes count too — a room with fewer current viewers but heavy
      // recent gifting activity should still surface, not just whoever
      // has the single highest live viewer count right now.
      const scored = rooms
        .map((r) => ({ ...r, _score: r.viewer_count * 3 + r.gift_count * 2 + r.like_count }))
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...r }) => r);

      res.json(scored);
    } catch (e) {
      console.error('Recommendation error:', e);
      res.status(500).json({ error: 'Unable to load recommendations', code: 'RECOMMEND_FAILED' });
    }
  });

  return router;
};
