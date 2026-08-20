const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

module.exports = (prisma) => {
  const router = require('express').Router();

  const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(20),
    password: z.string().min(8),
    dateOfBirth: z.string().transform(d => new Date(d))
  });

  router.post('/register', async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.errors });

    const { email, username, password, dateOfBirth } = result.data;
    const age = new Date().getFullYear() - dateOfBirth.getFullYear();
    if (age < 18) return res.status(403).json({ error: 'You must be 18 or older.' });

    const hashed = await bcrypt.hash(password, 12);
    try {
      const user = await prisma.user.create({
        data: { 
          email, username, password_hash: hashed, date_of_birth: dateOfBirth, 
          display_name: username, age_verified: true 
        }
      });
      await prisma.wallet.create({ data: { user_id: user.id, balance: 0 } });
      // TODO: send verification email
      res.status(201).json({ id: user.id, message: 'Verification email sent.' });
    } catch (e) {
      res.status(400).json({ error: 'Email or username already exists.' });
    }
  });

  router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    if (!user.is_active) return res.status(403).json({ error: 'Account suspended.' });

    const accessToken = jwt.sign({ id: user.id, tier: user.membership_tier }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await prisma.session.create({
      data: { user_id: user.id, refresh_token: refreshToken, expires_at: new Date(Date.now() + 7*24*60*60*1000) }
    });

    res.json({ accessToken, refreshToken, user: { id: user.id, username: user.username, level: user.level } });
  });

  router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    const session = await prisma.session.findUnique({ where: { refresh_token: refreshToken } });
    if (!session || session.expires_at < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user_id } });
    const newAccess = jwt.sign({ id: user.id, tier: user.membership_tier }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken: newAccess });
  });

  router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    await prisma.session.deleteMany({ where: { refresh_token: refreshToken } });
    res.json({ success: true });
  });

  return router;
};
