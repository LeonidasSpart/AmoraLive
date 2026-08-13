import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(notifications);
});

router.get('/unread-count', authenticate, async (req: AuthRequest, res) => {
  const count = await prisma.notification.count({ where: { userId: req.user.id, read: false } });
  res.json({ count });
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!notification || notification.userId !== req.user.id) return res.status(404).json({ error: 'Not found' });
  await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });
  res.json({ success: true });
});

router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } });
  res.json({ success: true });
});

export default router;
