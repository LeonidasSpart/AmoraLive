import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.user.id },
    orderBy: { startedAt: 'desc' },
  });
  res.json(subscriptions);
});

router.get('/active', authenticate, async (req: AuthRequest, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: req.user.id,
      status: 'ACTIVE',
      expiresAt: { gt: new Date() },
    },
  });
  res.json(subscription);
});

export default router;
