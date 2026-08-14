const express = require('express');
const { pool } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get active streams
router.get('/live', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.id, s.title, s.thumbnail, s.category, s.viewer_count, s.started_at,
             u.id as streamer_id, u.username, u.display_name, u.avatar, u.is_verified
      FROM streams s
      JOIN users u ON s.streamer_id = u.id
      WHERE s.status = 'live' AND u.is_banned = false
    `;
    const params = [];

    if (category) {
      query += ` AND s.category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY s.viewer_count DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      streams: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        thumbnail: row.thumbnail,
        category: row.category,
        viewerCount: row.viewer_count,
        startedAt: row.started_at,
        streamer: {
          id: row.streamer_id,
          username: row.username,
          displayName: row.display_name,
          avatar: row.avatar,
          isVerified: row.is_verified,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Get stream categories
router.get('/categories', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(*) as count
       FROM streams WHERE status = 'live'
       GROUP BY category ORDER BY count DESC`
    );
    res.json({ categories: result.rows });
  } catch (err) {
    next(err);
  }
});

// Start stream
router.post('/start', authenticate, async (req, res, next) => {
  try {
    const { title, category, thumbnail } = req.body;

    // Check if already streaming
    const existing = await pool.query(
      'SELECT id FROM streams WHERE streamer_id = $1 AND status = \'live\'',
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You already have an active stream' });
    }

    const streamId = uuidv4();
    const agoraToken = generateAgoraToken(streamId, req.user.id);

    const result = await pool.query(
      `INSERT INTO streams (id, streamer_id, title, category, thumbnail, status, viewer_count, started_at, agora_channel, agora_token)
       VALUES ($1, $2, $3, $4, $5, 'live', 0, NOW(), $6, $7)
       RETURNING *`,
      [streamId, req.user.id, title, category || 'general', thumbnail, streamId, agoraToken]
    );

    await pool.query('UPDATE users SET is_streamer = true WHERE id = $1', [req.user.id]);

    res.status(201).json({
      stream: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        category: result.rows[0].category,
        agoraChannel: result.rows[0].agora_channel,
        agoraToken: result.rows[0].agora_token,
      },
    });
  } catch (err) {
    next(err);
  }
});

// End stream
router.post('/end/:streamId', authenticate, async (req, res, next) => {
  try {
    const { streamId } = req.params;

    const stream = await pool.query(
      'SELECT * FROM streams WHERE id = $1 AND streamer_id = $2',
      [streamId, req.user.id]
    );

    if (stream.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const duration = Math.floor((new Date() - new Date(stream.rows[0].started_at)) / 1000);

    await pool.query(
      `UPDATE streams SET status = 'ended', ended_at = NOW(), duration = $1 WHERE id = $2`,
      [duration, streamId]
    );

    await pool.query(
      'UPDATE users SET stream_count = stream_count + 1, total_viewers = total_viewers + $1 WHERE id = $2',
      [stream.rows[0].viewer_count, req.user.id]
    );

    res.json({ message: 'Stream ended', duration });
  } catch (err) {
    next(err);
  }
});

// Get stream details
router.get('/:streamId', optionalAuth, async (req, res, next) => {
  try {
    const { streamId } = req.params;

    const result = await pool.query(
      `SELECT s.*, u.username, u.display_name, u.avatar, u.is_verified, u.follower_count
       FROM streams s
       JOIN users u ON s.streamer_id = u.id
       WHERE s.id = $1`,
      [streamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const stream = result.rows[0];
    let isFollowing = false;

    if (req.user) {
      const followResult = await pool.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [req.user.id, stream.streamer_id]
      );
      isFollowing = followResult.rows.length > 0;
    }

    res.json({
      stream: {
        id: stream.id,
        title: stream.title,
        thumbnail: stream.thumbnail,
        category: stream.category,
        status: stream.status,
        viewerCount: stream.viewer_count,
        startedAt: stream.started_at,
        endedAt: stream.ended_at,
        duration: stream.duration,
        streamer: {
          id: stream.streamer_id,
          username: stream.username,
          displayName: stream.display_name,
          avatar: stream.avatar,
          isVerified: stream.is_verified,
          followerCount: stream.follower_count,
        },
        isFollowing,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Join stream (increment viewer)
router.post('/join/:streamId', async (req, res, next) => {
  try {
    const { streamId } = req.params;

    await pool.query(
      'UPDATE streams SET viewer_count = viewer_count + 1 WHERE id = $1 AND status = \'live\'',
      [streamId]
    );

    res.json({ message: 'Joined stream' });
  } catch (err) {
    next(err);
  }
});

// Leave stream
router.post('/leave/:streamId', async (req, res, next) => {
  try {
    const { streamId } = req.params;

    await pool.query(
      'UPDATE streams SET viewer_count = GREATEST(viewer_count - 1, 0) WHERE id = $1 AND status = \'live\'',
      [streamId]
    );

    res.json({ message: 'Left stream' });
  } catch (err) {
    next(err);
  }
});

// Generate Agora token helper
function generateAgoraToken(channelName, uid) {
  // In production, use Agora Token Builder
  // For now, return a placeholder that your frontend will replace
  return `agora-token-${channelName}-${uid}-${Date.now()}`;
}

module.exports = router;
