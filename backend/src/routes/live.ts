import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// In-memory store for active streams (replace with DB later)
const activeStreams = new Map<string, any>();

const createStreamSchema = z.object({
  title: z.string().min(1).max(100),
});

// GET /api/live/active – list all active streams
router.get('/active', authenticate, async (req: AuthRequest, res) => {
  const streams = Array.from(activeStreams.values());
  res.json(streams);
});

// POST /api/live/create – start a new stream
router.post('/create', authenticate, async (req: AuthRequest, res) => {
  const parsed = createStreamSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid stream data',
      errors: parsed.error.issues,
    });
  }

  const { title } = parsed.data;
  const streamId = `stream_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Mock ingest and playback URLs – replace with Agora/Mux later
  const ingestUrl = `rtmp://ingest.example.com/live/${streamId}`;
  const playbackUrl = `https://playback.example.com/live/${streamId}.m3u8`;

  const streamData = {
    id: streamId,
    userId: req.user.id,
    title,
    viewerCount: 0,
    user: {
      id: req.user.id,
      displayName: req.user.displayName,
      avatar: req.user.avatar,
    },
    startedAt: new Date().toISOString(),
    ingestUrl,
    playbackUrl,
  };

  activeStreams.set(streamId, streamData);

  // FIXED: streamData already contains id, ingestUrl, playbackUrl
  // No need to duplicate them before spreading
  res.status(201).json(streamData);
});

// POST /api/live/end/:streamId – end a stream
router.post('/end/:streamId', authenticate, async (req: AuthRequest, res) => {
  const streamId = String(req.params.streamId);
  const stream = activeStreams.get(streamId);

  if (!stream) {
    return res.status(404).json({ message: 'Stream not found' });
  }

  if (stream.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not your stream' });
  }

  activeStreams.delete(streamId);
  res.json({ success: true, message: 'Stream ended' });
});

export default router;
