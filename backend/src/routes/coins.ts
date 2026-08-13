import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

const addCoinsSchema = z.object({
  amount: z.number().int().positive(),
});

router.get('/balance', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { coins: true },
  });
  res.json({ coins: user?.coins || 0 });
});

router.post('/add', authenticate, async (req: AuthRequest, res) => {
  const parsed = addCoinsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid amount',
      errors: parsed.error.issues,
    });
  }

  const { amount } = parsed.data;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { coins: { increment: amount } },
  });
  res.json({ coins: user.coins });
});

export default router;
