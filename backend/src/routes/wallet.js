const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  router.get('/me', auth, async (req, res) => {
    const wallet = await prisma.wallet.findUnique({ where: { user_id: req.user.id } });
    res.json(wallet);
  });

  return router;
};
