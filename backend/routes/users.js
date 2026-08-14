const express = require('express');
const { pool } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { updateProfileValidation } = require('../middleware/validation');

const router = express.Router();

// Get user profile
router.get('/profile/:username', optionalAuth, async (req, res, next) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `SELECT id, username, display_name, avatar, bio, gender, birth_date, 
              coins, diamonds, vip_level, follower_count, following_count, 
              stream_count, total_viewers, created_at, is_verified, is_streamer
       FROM users WHERE username = $1 AND is_banned = false`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    let isFollowing = false;

    if (req.user) {
      const followResult = await pool.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [req.user.id, user.id]
      );
      isFollowing = followResult.rows.length > 0;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar,
        bio: user.bio,
        gender: user.gender,
        birthDate: user.birth_date,
        coins: user.coins,
        diamonds: user.diamonds,
        vipLevel: user.vip_level,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        streamCount: user.stream_count,
        totalViewers: user.total_viewers,
        isVerified: user.is_verified,
        isStreamer: user.is_streamer,
        isFollowing,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update profile
router.patch('/profile', authenticate, updateProfileValidation, async (req, res, next) => {
  try {
    const { displayName, bio, gender, birthDate, avatar } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           gender = COALESCE($3, gender),
           birth_date = COALESCE($4, birth_date),
           avatar = COALESCE($5, avatar),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, username, display_name, avatar, bio, gender, birth_date, coins, diamonds, vip_level`,
      [displayName, bio, gender, birthDate, avatar, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Follow/unfollow user
router.post('/follow/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existing = await pool.query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, userId]
    );

    if (existing.rows.length > 0) {
      // Unfollow
      await pool.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [req.user.id, userId]);
      await pool.query('UPDATE users SET follower_count = follower_count - 1 WHERE id = $1', [userId]);
      await pool.query('UPDATE users SET following_count = following_count - 1 WHERE id = $1', [req.user.id]);
      res.json({ following: false });
    } else {
      // Follow
      await pool.query(
        'INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (gen_random_uuid(), $1, $2, NOW())',
        [req.user.id, userId]
      );
      await pool.query('UPDATE users SET follower_count = follower_count + 1 WHERE id = $1', [userId]);
      await pool.query('UPDATE users SET following_count = following_count + 1 WHERE id = $1', [req.user.id]);
      res.json({ following: true });
    }
  } catch (err) {
    next(err);
  }
});

// Get followers
router.get('/followers/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar, u.is_verified, f.created_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ followers: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get following
router.get('/following/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar, u.is_verified, f.created_at
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ following: result.rows });
  } catch (err) {
    next(err);
  }
});

// Search users
router.get('/search', async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;

    const result = await pool.query(
      `SELECT id, username, display_name, avatar, is_verified, is_streamer, follower_count
       FROM users
       WHERE (username ILIKE $1 OR display_name ILIKE $1) AND is_banned = false
       ORDER BY follower_count DESC
       LIMIT $2 OFFSET $3`,
      [searchTerm, limit, offset]
    );

    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
});

// Get top streamers
router.get('/top-streamers', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT id, username, display_name, avatar, follower_count, total_viewers, is_verified
       FROM users
       WHERE is_streamer = true AND is_banned = false
       ORDER BY follower_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ streamers: result.rows });
  } catch (err) {
    next(err);
  }
});

// Block user
router.post('/block/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    await pool.query(
      `INSERT INTO blocks (id, blocker_id, blocked_id, created_at)
       VALUES (gen_random_uuid(), $1, $2, NOW())
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [req.user.id, userId]
    );

    res.json({ blocked: true });
  } catch (err) {
    next(err);
  }
});

// Unblock user
router.delete('/block/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    await pool.query('DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2', [req.user.id, userId]);
    res.json({ blocked: false });
  } catch (err) {
    next(err);
  }
});

// Report user
router.post('/report', authenticate, async (req, res, next) => {
  try {
    const { reportedId, reason, details } = req.body;

    await pool.query(
      `INSERT INTO reports (id, reporter_id, reported_id, reason, details, status, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 'pending', NOW())`,
      [req.user.id, reportedId, reason, details]
    );

    res.json({ message: 'Report submitted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
