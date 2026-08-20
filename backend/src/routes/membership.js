const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  router.get('/plans', async (req, res) => {
    res.json([{ tier: 'premium', price: 9.99 }, { tier: 'vip', price: 29.99 }]);
  });

  router.post('/subscribe', auth, async (req, res) => {
    res.json({ success: true });
  });

  return router;
};
