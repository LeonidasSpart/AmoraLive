import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const updateSchema = z.object({
  displayName: z.string().optional(),
  username: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  goal: z.enum(['LIFE_PARTNER', 'MARRIAGE', 'LONG_TERM']).optional(),
});

router.get('/discover', authenticate, async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  // Get user's preferences to filter
  const prefs = await prisma.preference.findUnique({ where: { userId: req.user.id } });
  const users = await prisma.user.findMany({
    where: {
      id: { not: req.user.id },
      ...(prefs?.preferredGender ? { gender: prefs.preferredGender } : {}),
      ...(prefs?.minAge || prefs?.maxAge ? {
        dateOfBirth: {
          ...(prefs?.minAge ? { lte: new Date(new Date().setFullYear(new Date().getFullYear() - prefs.minAge)) } : {}),
          ...(prefs?.maxAge ? { gte: new Date(new Date().setFullYear(new Date().getFullYear() - prefs.maxAge)) } : {}),
        }
      } : {}),
    },
    skip,
    take: limit,
    include: { photos: true },
  });
  res.json({ users, page, limit });
});

router.get('/:id', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { photos: true, preferences: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: parsed.data,
  });
  res.json(updated);
});

export default router;
