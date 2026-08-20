const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // Simple admin check – you can expand later
  router.get('/users', auth, async (req, res) => {
    const users = await prisma.user.findMany({ take: 10 });
    res.json(users);
  });

  return router;
};
