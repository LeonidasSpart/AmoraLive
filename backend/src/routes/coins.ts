import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/balance', authenticate, async (req: AuthRequest, res) => {
  // Assuming a coins field on User – add to schema if missing
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { coins: true } });
  res.json({ coins: user?.coins || 0 });
});

// This should be protected with payment verification later
router.post('/add', authenticate, async (req: AuthRequest, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { coins: { increment: amount } },
  });
  res.json({ coins: user.coins });
});

export default router;
