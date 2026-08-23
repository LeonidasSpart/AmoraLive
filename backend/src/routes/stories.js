// backend/src/routes/stories.js
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { UTApi } = require('uploadthing/server');

const utapi = process.env.UPLOADTHING_TOKEN ? new UTApi() : null;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB — video needs more headroom than the 5MB profile-photo limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|mp4|mov|webm/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = /^(image|video)\//.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image or video files are allowed'));
  }
});

const storyAuthorSelect = {
  id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true
};

module.exports = (prisma, io) => {
  const router = require('express').Router();

  // Blocks are always enforced regardless of a story's privacy setting.
  async function getBlockedSet(userId) {
    const [blockedByMe, blockedMe] = await Promise.all([
      prisma.block.findMany({ where: { blocker_id: userId }, select: { blocked_id: true } }),
      prisma.block.findMany({ where: { blocked_id: userId }, select: { blocker_id: true } })
    ]);
    return new Set([...blockedByMe.map(b => b.blocked_id), ...blockedMe.map(b => b.blocker_id)]);
  }

  async function canView(viewerId, story) {
    if (story.user_id === viewerId) return true;
    if (story.privacy === 'private') return false;
    const blocked = await getBlockedSet(viewerId);
    if (blocked.has(story.user_id)) return false;
    if (story.privacy === 'public') return true;
    if (story.privacy === 'followers') {
      const follow = await prisma.follow.findUnique({
        where: { follower_id_following_id: { follower_id: viewerId, following_id: story.user_id } }
      });
      return !!follow;
    }
    return false;
  }

  // ---------- POST /stories (create) ----------
  router.post('/', auth, upload.single('media'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'A photo or video is required.', code: 'MEDIA_REQUIRED' });
    if (!utapi) return res.status(503).json({ error: 'Media storage is not configured.', code: 'STORAGE_NOT_CONFIGURED' });

    const privacy = ['public', 'followers', 'private'].includes(req.body.privacy) ? req.body.privacy : 'public';
    const caption = String(req.body.caption || '').slice(0, 280) || null;
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';

    try {
      const ext = path.extname(req.file.originalname).toLowerCase() || (mediaType === 'video' ? '.mp4' : '.jpg');
      const filename = `story-${req.user.id}-${Date.now()}${ext}`;
      const file = new File([req.file.buffer], filename, { type: req.file.mimetype });

      const result = await utapi.uploadFiles(file);
      if (result.error) throw new Error(result.error.message || 'Upload failed');
      const mediaUrl = result.data.ufsUrl || result.data.url;

      const story = await prisma.story.create({
        data: {
          user_id: req.user.id,
          media_url: mediaUrl,
          media_type: mediaType,
          caption,
          privacy,
          expires_at: new Date(Date.now() + 24 * 3600 * 1000)
        },
        include: { user: { select: storyAuthorSelect } }
      });

      // Real-time story delivery would need clients to join a per-follower
      // room, which nothing in this codebase currently does — leaving that
      // out rather than emitting to a room nobody's listening on. The
      // story bar picks up new stories on its own poll/refresh instead.

      res.status(201).json(story);
    } catch (e) {
      console.error('Story creation error:', e);
      res.status(500).json({ error: 'Unable to create story.', code: 'STORY_CREATE_FAILED' });
    }
  });

  // ---------- GET /stories/feed ----------
  // Grouped by author: people you follow (plus yourself) with at least one
  // unexpired story, most recently-posted author first.
  router.get('/feed', auth, async (req, res) => {
    try {
      const following = await prisma.follow.findMany({ where: { follower_id: req.user.id }, select: { following_id: true } });
      const authorIds = [...following.map(f => f.following_id), req.user.id];
      const blocked = await getBlockedSet(req.user.id);

      const stories = await prisma.story.findMany({
        where: {
          user_id: { in: authorIds.filter(id => !blocked.has(id)) },
          expires_at: { gt: new Date() },
          OR: [
            { privacy: 'public' },
            { privacy: 'followers' },
            { user_id: req.user.id, privacy: 'private' }
          ]
        },
        orderBy: { created_at: 'asc' },
        include: {
          user: { select: storyAuthorSelect },
          views: { where: { viewer_id: req.user.id }, select: { viewer_id: true } }
        }
      });

      const byAuthor = {};
      for (const story of stories) {
        const key = story.user_id;
        if (!byAuthor[key]) byAuthor[key] = { user: story.user, stories: [], hasUnseen: false };
        const seen = story.views.length > 0;
        byAuthor[key].stories.push({ id: story.id, media_url: story.media_url, media_type: story.media_type, caption: story.caption, created_at: story.created_at, expires_at: story.expires_at, seen });
        if (!seen && story.user_id !== req.user.id) byAuthor[key].hasUnseen = true;
      }

      // Self first (if present), then unseen authors, then seen — matches
      // the ordering convention most story UIs use.
      const groups = Object.values(byAuthor).sort((a, b) => {
        if (a.user.id === req.user.id) return -1;
        if (b.user.id === req.user.id) return 1;
        return (b.hasUnseen ? 1 : 0) - (a.hasUnseen ? 1 : 0);
      });

      res.json(groups);
    } catch (e) {
      console.error('Story feed error:', e);
      res.status(500).json({ error: 'Unable to load stories.', code: 'FEED_LOAD_FAILED' });
    }
  });

  // ---------- GET /stories/mine (includes expired — the archive) ----------
  router.get('/mine', auth, async (req, res) => {
    try {
      const stories = await prisma.story.findMany({
        where: { user_id: req.user.id },
        orderBy: { created_at: 'desc' },
        take: 100,
        include: {
          _count: { select: { views: true, reactions: true } }
        }
      });
      res.json(stories.map(s => ({ ...s, isExpired: s.expires_at < new Date(), viewCount: s._count.views, reactionCount: s._count.reactions, _count: undefined })));
    } catch (e) {
      res.status(500).json({ error: 'Unable to load your stories.', code: 'MINE_LOAD_FAILED' });
    }
  });

  // ---------- GET /stories/:id/viewers (owner only) ----------
  router.get('/:id/viewers', auth, async (req, res) => {
    try {
      const story = await prisma.story.findUnique({ where: { id: req.params.id }, select: { user_id: true } });
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (story.user_id !== req.user.id) return res.status(403).json({ error: 'Only the story owner can see viewers.' });

      const views = await prisma.storyView.findMany({
        where: { story_id: req.params.id },
        orderBy: { viewed_at: 'desc' },
        include: { viewer: { select: storyAuthorSelect } }
      });
      res.json(views.map(v => ({ user: v.viewer, viewedAt: v.viewed_at })));
    } catch (e) {
      res.status(500).json({ error: 'Unable to load viewers.', code: 'VIEWERS_LOAD_FAILED' });
    }
  });

  // ---------- POST /stories/:id/view ----------
  router.post('/:id/view', auth, async (req, res) => {
    try {
      const story = await prisma.story.findUnique({ where: { id: req.params.id } });
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (!(await canView(req.user.id, story))) return res.status(403).json({ error: 'You cannot view this story.' });

      await prisma.storyView.upsert({
        where: { story_id_viewer_id: { story_id: req.params.id, viewer_id: req.user.id } },
        update: {},
        create: { story_id: req.params.id, viewer_id: req.user.id }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Unable to record view.', code: 'VIEW_FAILED' });
    }
  });

  // ---------- POST /stories/:id/react ----------
  router.post('/:id/react', auth, async (req, res) => {
    const emoji = String(req.body.emoji || '').slice(0, 8);
    if (!emoji) return res.status(400).json({ error: 'An emoji is required.' });

    try {
      const story = await prisma.story.findUnique({ where: { id: req.params.id } });
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (!(await canView(req.user.id, story))) return res.status(403).json({ error: 'You cannot react to this story.' });

      await prisma.storyReaction.upsert({
        where: { story_id_user_id: { story_id: req.params.id, user_id: req.user.id } },
        update: { emoji },
        create: { story_id: req.params.id, user_id: req.user.id, emoji }
      });

      if (story.user_id !== req.user.id) {
        const reactor = await prisma.user.findUnique({ where: { id: req.user.id }, select: { display_name: true, username: true } });
        await prisma.notification.create({
          data: { user_id: story.user_id, type: 'story_reaction', payload: { fromId: req.user.id, fromName: reactor?.display_name || reactor?.username, emoji, storyId: story.id } }
        }).catch(err => console.error('Failed to create story reaction notification:', err.message));
      }

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Unable to react.', code: 'REACT_FAILED' });
    }
  });

  // ---------- POST /stories/:id/reply ----------
  // Replying to a story sends the owner a real DM (tagged with story_id)
  // rather than a separate reply system — it's the same underlying
  // relationship a DM already is, and it means the reply shows up in their
  // normal inbox instead of a second place to check.
  router.post('/:id/reply', auth, async (req, res) => {
    const content = String(req.body.content || '').trim().slice(0, 1000);
    if (!content) return res.status(400).json({ error: 'A message is required.' });

    try {
      const story = await prisma.story.findUnique({ where: { id: req.params.id } });
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (!(await canView(req.user.id, story))) return res.status(403).json({ error: 'You cannot reply to this story.' });
      if (story.user_id === req.user.id) return res.status(400).json({ error: 'You cannot reply to your own story.' });

      const message = await prisma.message.create({
        data: { sender_id: req.user.id, receiver_id: story.user_id, content, story_id: story.id },
        include: { sender: { select: storyAuthorSelect } }
      });

      const sender = message.sender;
      await prisma.notification.create({
        data: { user_id: story.user_id, type: 'new_message', payload: { senderId: req.user.id, senderName: sender.display_name || sender.username, preview: content.slice(0, 120), storyReply: true } }
      }).catch(err => console.error('Failed to create story-reply notification:', err.message));

      io.to(`user-${story.user_id}`).emit('private-message', message);

      res.status(201).json(message);
    } catch (e) {
      console.error('Story reply error:', e);
      res.status(500).json({ error: 'Unable to send reply.', code: 'REPLY_FAILED' });
    }
  });

  // ---------- DELETE /stories/:id ----------
  router.delete('/:id', auth, async (req, res) => {
    try {
      const story = await prisma.story.findUnique({ where: { id: req.params.id }, select: { user_id: true } });
      if (!story) return res.status(404).json({ error: 'Story not found' });
      if (story.user_id !== req.user.id) return res.status(403).json({ error: 'Only the story owner can delete it.' });

      await prisma.$transaction([
        prisma.storyView.deleteMany({ where: { story_id: req.params.id } }),
        prisma.storyReaction.deleteMany({ where: { story_id: req.params.id } }),
        prisma.story.delete({ where: { id: req.params.id } })
      ]);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Unable to delete story.', code: 'DELETE_FAILED' });
    }
  });

  return router;
};
