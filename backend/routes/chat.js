const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get chat history for a stream
router.get('/stream/:streamId', async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT c.id, c.message, c.type, c.created_at,
              u.id as user_id, u.username, u.display_name, u.avatar, u.vip_level
       FROM chat_messages c
       JOIN users u ON c.user_id = u.id
       WHERE c.stream_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [streamId, limit, offset]
    );

    res.json({
      messages: result.rows.map(row => ({
        id: row.id,
        message: row.message,
        type: row.type,
        createdAt: row.created_at,
        user: {
          id: row.user_id,
          username: row.username,
          displayName: row.display_name,
          avatar: row.avatar,
          vipLevel: row.vip_level,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Send chat message (REST fallback)
router.post('/stream/:streamId', authenticate, async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const { message, type = 'text' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 chars)' });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (id, stream_id, user_id, message, type, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, message, type, created_at`,
      [uuidv4(), streamId, req.user.id, message.trim(), type]
    );

    res.status(201).json({
      message: {
        id: result.rows[0].id,
        message: result.rows[0].message,
        type: result.rows[0].type,
        createdAt: result.rows[0].created_at,
        user: {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.display_name,
          avatar: req.user.avatar,
          vipLevel: req.user.vip_level,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get private messages
router.get('/private/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT m.*, 
              su.username as sender_username, su.avatar as sender_avatar,
              ru.username as receiver_username, ru.avatar as receiver_avatar
       FROM private_messages m
       JOIN users su ON m.sender_id = su.id
       JOIN users ru ON m.receiver_id = ru.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.id, userId, limit, offset]
    );

    // Mark as read
    await pool.query(
      'UPDATE private_messages SET is_read = true WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false',
      [req.user.id, userId]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    next(err);
  }
});

// Send private message
router.post('/private/:userId', authenticate, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const result = await pool.query(
      `INSERT INTO private_messages (id, sender_id, receiver_id, message, is_read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING *`,
      [uuidv4(), req.user.id, userId, message.trim()]
    );

    res.status(201).json({ message: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Get unread message count
router.get('/unread-count', authenticate, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM private_messages WHERE receiver_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
