// backend/src/routes/messages.js
const auth = require('../middleware/auth');
const { incrementMissionProgress } = require('../lib/missions');

module.exports = (prisma, io) => {
  const router = require('express').Router();

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
      res.json(conversations);
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
