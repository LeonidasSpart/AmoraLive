import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const matches = await prisma.match.findMany({
    where: {
      status: 'ACTIVE',
      OR: [{ userAId: req.user.id }, { userBId: req.user.id }],
    },
    include: {
      userA: { include: { photos: true } },
      userB: { include: { photos: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(matches);
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const matchId = String(req.params.id);
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== req.user.id && match.userBId !== req.user.id)) {
    return res.status(404).json({ message: 'Match not found' });
  }
  await prisma.match.update({
    where: { id: matchId },
    data: { status: 'UNMATCHED' },
  });
  res.json({ success: true });
});

export default router;
