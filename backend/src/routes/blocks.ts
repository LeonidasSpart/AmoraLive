import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/:userId', authenticate, async (req: AuthRequest, res) => {
  const blockedId = req.params.userId;
  if (blockedId === req.user.id) return res.status(400).json({ message: 'Cannot block yourself' });
  const existing = await prisma.block.findFirst({ where: { blockerId: req.user.id, blockedId } });
  if (existing) return res.status(409).json({ message: 'Already blocked' });
  const block = await prisma.block.create({ data: { blockerId: req.user.id, blockedId } });
  res.status(201).json(block);
});

router.delete('/:userId', authenticate, async (req: AuthRequest, res) => {
  await prisma.block.deleteMany({ where: { blockerId: req.user.id, blockedId: req.params.userId } });
  res.json({ success: true });
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const blocks = await prisma.block.findMany({
    where: { blockerId: req.user.id },
    include: { blocked: true },
  });
  res.json(blocks);
});

export default router;
