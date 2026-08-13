import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/create', authenticate, async (req, res) => {
  // Integrate with Agora/Mux here
  res.json({ streamId: 'dummy', ingestUrl: 'rtmp://...', playbackUrl: 'https://...' });
});

router.get('/active', authenticate, async (req, res) => {
  res.json([]);
});

export default router;
