const express = require('express');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get available gifts
router.get('/list', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, icon_url, coin_cost, diamond_cost, animation_url, rarity FROM gifts ORDER BY coin_cost ASC'
    );
    res.json({ gifts: result.rows });
  } catch (err) {
    next(err);
  }
});

// Send gift
router.post('/send', authenticate, async (req, res, next) => {
  try {
    const { streamId, giftId, quantity = 1 } = req.body;

    const giftResult = await pool.query('SELECT * FROM gifts WHERE id = $1', [giftId]);
    if (giftResult.rows.length === 0) {
      return res.status(404).json({ error: 'Gift not found' });
    }

    const gift = giftResult.rows[0];
    const totalCost = gift.coin_cost * quantity;

    // Check user balance
    const userResult = await pool.query('SELECT coins, diamonds FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if (user.coins < totalCost) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Deduct coins
    await pool.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [totalCost, req.user.id]);

    // Add to streamer
    const streamResult = await pool.query('SELECT streamer_id FROM streams WHERE id = $1', [streamId]);
    if (streamResult.rows.length > 0) {
      const streamerId = streamResult.rows[0].streamer_id;
      await pool.query('UPDATE users SET diamonds = diamonds + $1 WHERE id = $2', [gift.diamond_cost * quantity, streamerId]);
    }

    // Record transaction
    await pool.query(
      `INSERT INTO gift_transactions (id, sender_id, stream_id, gift_id, quantity, total_cost, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [uuidv4(), req.user.id, streamId, giftId, quantity, totalCost]
    );

    res.json({
      message: 'Gift sent successfully',
      remainingCoins: user.coins - totalCost,
    });
  } catch (err) {
    next(err);
  }
});

// Get gift history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT gt.*, g.name as gift_name, g.icon_url, s.title as stream_title
       FROM gift_transactions gt
       JOIN gifts g ON gt.gift_id = g.id
       LEFT JOIN streams s ON gt.stream_id = s.id
       WHERE gt.sender_id = $1
       ORDER BY gt.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({ history: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
