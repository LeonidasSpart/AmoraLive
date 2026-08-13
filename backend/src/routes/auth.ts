import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  displayName: z.string().optional(),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string() });

const generateTokens = (userId: number) => ({
  accessToken: jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d' }),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const { email, username, password, displayName } = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) return res.status(409).json({ error: 'Email or username already taken' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, username, passwordHash: hashed, displayName: displayName || username },
  });
  const tokens = generateTokens(user.id);
  await prisma.session.create({
    data: { userId: user.id, refreshToken: await bcrypt.hash(tokens.refreshToken, 10), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  res.status(201).json({ user, ...tokens });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const tokens = generateTokens(user.id);
  await prisma.session.create({
    data: { userId: user.id, refreshToken: await bcrypt.hash(tokens.refreshToken, 10), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });
  res.json({ user, ...tokens });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: number };
    const session = await prisma.session.findFirst({
      where: { userId: decoded.userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!session) return res.status(401).json({ error: 'Invalid session' });
    const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (!isValid) return res.status(401).json({ error: 'Invalid token' });
    const newTokens = generateTokens(decoded.userId);
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: await bcrypt.hash(newTokens.refreshToken, 10) },
    });
    res.json(newTokens);
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  await prisma.session.deleteMany({ where: { userId: req.user.id } });
  res.json({ success: true });
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
