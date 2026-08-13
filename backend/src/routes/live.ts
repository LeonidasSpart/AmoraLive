import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/create', authenticate, async (req: AuthRequest, res) => {
  // Create a live stream record, return ingest URL
  res.json({ streamId: 'dummy', ingestUrl: 'rtmp://...', playbackUrl: 'https://...' });
});

router.get('/active', authenticate, async (req, res) => {
  // List active streams
  res.json([]);
});

export default router;
