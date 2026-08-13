import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const reportSchema = z.object({ reason: z.string(), details: z.string().optional() });

router.post('/:userId', authenticate, async (req: AuthRequest, res) => {
  const reportedId = parseInt(req.params.userId);
  if (reportedId === req.user.id) return res.status(400).json({ error: 'Cannot report yourself' });
  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });
  const report = await prisma.report.create({
    data: { reporterId: req.user.id, reportedId, reason: parsed.data.reason, details: parsed.data.details },
  });
  res.status(201).json(report);
});

export default router;
