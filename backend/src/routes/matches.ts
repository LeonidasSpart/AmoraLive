import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const matches = await prisma.match.findMany({
    where: { OR: [{ user1Id: req.user.id }, { user2Id: req.user.id }], status: 'ACTIVE' },
    include: {
      user1: { include: { photos: true } },
      user2: { include: { photos: true } },
    },
  });
  res.json(matches);
});

router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const match = await prisma.match.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!match || (match.user1Id !== req.user.id && match.user2Id !== req.user.id)) {
    return res.status(404).json({ error: 'Match not found' });
  }
  await prisma.match.update({ where: { id: match.id }, data: { status: 'UNMATCHED' } });
  res.json({ success: true });
});

export default router;
