import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const reportSchema = z.object({
  reason: z.string().min(1),
  details: z.string().optional(),
});

router.post('/:userId', authenticate, async (req: AuthRequest, res) => {
  const reportedId = String(req.params.userId);
  if (reportedId === req.user.id) {
    return res.status(400).json({ message: 'Cannot report yourself' });
  }

  const parsed = reportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid report',
      errors: parsed.error.issues,
    });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: req.user.id,
      reportedId: reportedId,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
    },
  });

  res.status(201).json(report);
});

export default router;
