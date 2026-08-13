import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const messageSchema = z.object({ content: z.string().min(1), type: z.enum(['TEXT', 'IMAGE', 'SYSTEM']).optional() });

router.get('/:matchId/messages', authenticate, async (req: AuthRequest, res) => {
  const matchId = req.params.matchId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== req.user.id && match.userBId !== req.user.id)) {
    return res.status(403).json({ message: 'Not part of this match' });
  }
  const messages = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });
  res.json({ messages, page, limit });
});

router.post('/:matchId/messages', authenticate, async (req: AuthRequest, res) => {
  const matchId = req.params.matchId;
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid message', errors: parsed.error.issues });
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || (match.userAId !== req.user.id && match.userBId !== req.user.id)) {
    return res.status(403).json({ message: 'Not part of this match' });
  }
  const receiverId = match.userAId === req.user.id ? match.userBId : match.userAId;
  const message = await prisma.message.create({
    data: { matchId, senderId: req.user.id, receiverId, content: parsed.data.content, type: parsed.data.type || 'TEXT' },
  });
  await prisma.notification.create({
    data: { userId: receiverId, type: 'MESSAGE', title: 'New Message', body: `${req.user.displayName}: ${parsed.data.content}` },
  });
  res.status(201).json(message);
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  const message = await prisma.message.findUnique({ where: { id: req.params.id } });
  if (!message) return res.status(404).json({ message: 'Not found' });
  const match = await prisma.match.findUnique({ where: { id: message.matchId } });
  if (!match || (match.userAId !== req.user.id && match.userBId !== req.user.id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (message.senderId !== req.user.id) {
    await prisma.message.update({ where: { id: message.id }, data: { readAt: new Date() } });
  }
  res.json({ success: true });
});

export default router;
