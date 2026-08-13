import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/:userId', authenticate, async (req: AuthRequest, res) => {
  const receiverId = req.params.userId;
  if (receiverId === req.user.id) return res.status(400).json({ message: 'Cannot like yourself' });

  const target = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true, isActive: true } });
  if (!target || !target.isActive) return res.status(404).json({ message: 'User not found' });

  const blocked = await prisma.block.findFirst({
    where: { OR: [{ blockerId: req.user.id, blockedId: receiverId }, { blockerId: receiverId, blockedId: req.user.id }] },
  });
  if (blocked) return res.status(403).json({ message: 'Interaction unavailable' });

  const like = await prisma.like.upsert({
    where: { senderId_receiverId: { senderId: req.user.id, receiverId } },
    create: { senderId: req.user.id, receiverId },
    update: {},
  });

  const reciprocal = await prisma.like.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: req.user.id } },
  });
  let match = null;
  if (reciprocal) {
    const existingMatch = await prisma.match.findFirst({
      where: { OR: [{ userAId: req.user.id, userBId: receiverId }, { userAId: receiverId, userBId: req.user.id }] },
    });
    match = existingMatch ?? await prisma.match.create({ data: { userAId: req.user.id, userBId: receiverId } });
  }
  res.status(201).json({ like, matched: Boolean(match), match });
});

router.delete('/:userId', authenticate, async (req: AuthRequest, res) => {
  await prisma.like.deleteMany({ where: { senderId: req.user.id, receiverId: req.params.userId } });
  res.json({ success: true });
});

router.get('/received', authenticate, async (req: AuthRequest, res) => {
  const likes = await prisma.like.findMany({
    where: { receiverId: req.user.id },
    include: { sender: true },
  });
  res.json(likes);
});

router.get('/sent', authenticate, async (req: AuthRequest, res) => {
  const likes = await prisma.like.findMany({
    where: { senderId: req.user.id },
    include: { receiver: true },
  });
  res.json(likes);
});

export default router;
