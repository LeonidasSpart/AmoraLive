import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prefsSchema = z.object({
  minAge: z.number().int().optional(),
  maxAge: z.number().int().optional(),
  preferredGender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  maxDistanceKm: z.number().optional(),
  relationshipGoal: z.enum(['LIFE_PARTNER', 'MARRIAGE', 'LONG_TERM']).optional(),
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const prefs = await prisma.preference.findUnique({ where: { userId: req.user.id } });
  res.json(prefs || {});
});

router.put('/', authenticate, async (req: AuthRequest, res) => {
  const parsed = prefsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid data', errors: parsed.error.issues });
  const prefs = await prisma.preference.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, ...parsed.data },
    update: parsed.data,
  });
  res.json(prefs);
});

export default router;
