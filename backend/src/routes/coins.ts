import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/balance', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { coins: true } });
  res.json({ coins: user?.coins || 0 });
});

router.post('/add', authenticate, async (req: AuthRequest, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { coins: { increment: amount } },
  });
  res.json({ coins: user.coins });
});

export default router;
