import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const subs = await prisma.subscription.findMany({ where: { userId: req.user.id } });
  res.json(subs);
});

router.get('/active', authenticate, async (req: AuthRequest, res) => {
  const sub = await prisma.subscription.findFirst({
    where: { userId: req.user.id, status: 'ACTIVE', endDate: { gt: new Date() } },
  });
  res.json(sub);
});

export default router;
