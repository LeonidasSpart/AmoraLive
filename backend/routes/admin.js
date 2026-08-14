const express = require('express');
const { pool } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      usersResult,
      streamsResult,
      activeStreamsResult,
      transactionsResult,
      reportsResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM users'),
      pool.query('SELECT COUNT(*) as total FROM streams'),
      pool.query("SELECT COUNT(*) as total FROM streams WHERE status = 'live'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payment_transactions WHERE status = 'completed'"),
      pool.query("SELECT COUNT(*) as total FROM reports WHERE status = 'pending'"),
    ]);

    res.json({
      stats: {
        totalUsers: parseInt(usersResult.rows[0].total),
        totalStreams: parseInt(streamsResult.rows[0].total),
        activeStreams: parseInt(activeStreamsResult.rows[0].total),
        totalRevenue: parseInt(transactionsResult.rows[0].total) / 100,
        pendingReports: parseInt(reportsResult.rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, email, display_name, is_verified, is_banned, is_streamer, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (username ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (err) {
    next(err);
  }
});

// Ban/unban user
router.post('/users/:userId/ban', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    await pool.query(
      'UPDATE users SET is_banned = true, ban_reason = $1, banned_at = NOW() WHERE id = $2',
      [reason, userId]
    );

    // End all active streams
    await pool.query(
      "UPDATE streams SET status = 'ended', ended_at = NOW() WHERE streamer_id = $1 AND status = 'live'",
      [userId]
    );

    res.json({ message: 'User banned' });
  } catch (err) {
    next(err);
  }
});

router.post('/users/:userId/unban', async (req, res, next) => {
  try {
    const { userId } = req.params;
    await pool.query('UPDATE users SET is_banned = false, ban_reason = null, banned_at = null WHERE id = $1', [userId]);
    res.json({ message: 'User unbanned' });
  } catch (err) {
    next(err);
  }
});

// Get reports
router.get('/reports', async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT r.*, 
              reporter.username as reporter_username,
              reported.username as reported_username
       FROM reports r
       JOIN users reporter ON r.reporter_id = reporter.id
       JOIN users reported ON r.reported_id = reported.id
       WHERE r.status = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    res.json({ reports: result.rows });
  } catch (err) {
    next(err);
  }
});

// Update report status
router.patch('/reports/:reportId', async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, action } = req.body;

    await pool.query(
      'UPDATE reports SET status = $1, action_taken = $2, resolved_at = NOW() WHERE id = $3',
      [status, action, reportId]
    );

    res.json({ message: 'Report updated' });
  } catch (err) {
    next(err);
  }
});

// Get active streams
router.get('/streams', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.username, u.display_name
      FROM streams s
      JOIN users u ON s.streamer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND s.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY s.started_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ streams: result.rows });
  } catch (err) {
    next(err);
  }
});

// End stream (admin force)
router.post('/streams/:streamId/end', async (req, res, next) => {
  try {
    const { streamId } = req.params;
    const { reason } = req.body;

    await pool.query(
      "UPDATE streams SET status = 'ended', ended_at = NOW(), ended_by_admin = true, admin_end_reason = $1 WHERE id = $2",
      [reason, streamId]
    );

    res.json({ message: 'Stream ended by admin' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
