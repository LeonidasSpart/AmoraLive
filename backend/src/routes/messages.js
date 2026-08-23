// backend/src/routes/messages.js
const auth = require('../middleware/auth');
const { incrementMissionProgress } = require('../lib/missions');
const multer = require('multer');
const path = require('path');
const { UTApi } = require('uploadthing/server');

const utapi = process.env.UPLOADTHING_TOKEN ? new UTApi() : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB — enough headroom for a short video, not just photos
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|mp4|mov|webm/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = /^(image|video)\//.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image or video files are allowed'));
  }
});

module.exports = (prisma, io) => {
  const router = require('express').Router();

  // ---------- POST /messages/upload ----------
  // Uploads a photo/video for a chat message and returns just the URL —
  // no side effects, no message created here. The frontend uploads first,
  // then sends the actual message (via the private-message socket event,
  // same as text) with that URL in media_urls. This is what the chat
  // composer's attach (+) button was missing entirely before — the
  // backend already supported media messages end-to-end, there was just
  // no way to get a file turned into a URL to send.
  router.post('/upload', auth, upload.single('media'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'A photo or video is required.', code: 'MEDIA_REQUIRED' });
    if (!utapi) return res.status(503).json({ error: 'Media storage is not configured.', code: 'STORAGE_NOT_CONFIGURED' });

    try {
      const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      const ext = path.extname(req.file.originalname).toLowerCase() || (mediaType === 'video' ? '.mp4' : '.jpg');
      const filename = `chat-${req.user.id}-${Date.now()}${ext}`;
      const file = new File([req.file.buffer], filename, { type: req.file.mimetype });

      const result = await utapi.uploadFiles(file);
      if (result.error) throw new Error(result.error.message || 'Upload failed');
      const url = result.data.ufsUrl || result.data.url;

      res.json({ url, type: mediaType });
    } catch (e) {
      console.error('Chat media upload error:', e);
      res.status(500).json({ error: 'Unable to upload media.', code: 'UPLOAD_FAILED' });
    }
  });

  // GET /messages/conversations – list of chats with last message and unread count
  router.get('/conversations', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      // Get all users the current user has exchanged messages with
      const conversations = await prisma.$queryRaw`
        SELECT 
          u.id, u.username, u.display_name, u.profile_photo, u.online_status,
          u.is_verified, u.membership_tier,
          m.id as last_message_id, m.content as last_message, m.created_at as last_message_time,
          m.sender_id as last_sender_id,
          (SELECT COUNT(*) FROM "Message" WHERE "receiver_id" = ${userId} AND "sender_id" = u.id AND "read_at" IS NULL) as unread_count
        FROM "User" u
        JOIN "Message" m ON (m."sender_id" = u.id AND m."receiver_id" = ${userId}) OR (m."receiver_id" = u.id AND m."sender_id" = ${userId})
        WHERE u.id != ${userId}
        GROUP BY u.id, m.id
        ORDER BY m.created_at DESC
      `;
      // Postgres COUNT(*) comes back as a BigInt via $queryRaw, and
      // JSON.stringify (which res.json() uses internally) cannot
      // serialize BigInt at all — every call here was throwing before
      // ever reaching the response. Converting to a plain Number is safe;
      // an unread count will never come close to Number.MAX_SAFE_INTEGER.
      res.json(conversations.map((c) => ({ ...c, unread_count: Number(c.unread_count) })));
    } catch (e) {
      console.error('Error fetching conversations:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // GET /messages/:userId – get messages between current user and :userId
  router.get('/:userId', auth, async (req, res) => {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;
    const currentUserId = req.user.id;
    try {
      const where = {
        OR: [
          { sender_id: currentUserId, receiver_id: userId },
          { sender_id: userId, receiver_id: currentUserId }
        ]
      };
      if (before) {
        where.created_at = { lt: new Date(before) };
      }
      const messages = await prisma.message.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: Math.min(Number(limit), 100),
        include: {
          sender: {
            select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true }
          }
        }
      });
      // Mark messages from other user as read
      await prisma.message.updateMany({
        where: {
          sender_id: userId,
          receiver_id: currentUserId,
          read_at: null
        },
        data: { read_at: new Date() }
      });
      res.json(messages.reverse()); // return in ascending order
    } catch (e) {
      console.error('Error fetching messages:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // POST /messages/:userId – send a message
  router.post('/:userId', auth, async (req, res) => {
    const { userId } = req.params;
    const { content, type = 'text', media_urls = [] } = req.body;
    const currentUserId = req.user.id;
    if (!content && media_urls.length === 0) {
      return res.status(400).json({ error: 'Message content or media required' });
    }
    try {
      // Check if users have blocked each other
      const block = await prisma.block.findFirst({
        where: {
          OR: [
            { blocker_id: currentUserId, blocked_id: userId },
            { blocker_id: userId, blocked_id: currentUserId }
          ]
        }
      });
      if (block) {
        return res.status(403).json({ error: 'You cannot message this user' });
      }
      const message = await prisma.message.create({
        data: {
          sender_id: currentUserId,
          receiver_id: userId,
          content: content || '',
          type,
          media_urls
        },
        include: {
          sender: {
            select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true }
          }
        }
      });
      await prisma.notification.create({
        data: {
          user_id: userId,
          type: 'new_message',
          payload: { senderId: currentUserId, senderName: message.sender.display_name || message.sender.username, preview: (content || '').slice(0, 120) }
        }
      }).catch(err => console.error('Failed to create message notification:', err.message));

      prisma.$transaction((tx) => incrementMissionProgress(tx, currentUserId, 'messages_sent', 1))
        .catch(err => console.error('Mission progress (messages_sent) failed:', err.message));

      // Emit to recipient via socket
      io.to(`user-${userId}`).emit('private-message', message);
      res.status(201).json(message);
    } catch (e) {
      console.error('Error sending message:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
