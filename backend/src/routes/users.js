// backend/src/routes/users.js
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

module.exports = (prisma) => {
  const router = require('express').Router();

  // ---------- GET /users/me ----------
  router.get('/me', auth, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { wallet: true }
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { password_hash, ...safeUser } = user;
      res.json(safeUser);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- PATCH /users/me ----------
  router.patch('/me', auth, async (req, res) => {
    try {
      const { display_name, bio, interests, languages, relationship_intent, location } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          display_name,
          bio,
          interests: interests || [],
          languages: languages || [],
          relationship_intent,
          location: location || null
        }
      });
      const { password_hash, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- POST /users/me/change-password ----------
  router.post('/me/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { password_hash: true }
      });
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password_hash: hashed }
      });
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- GET /users/me/privacy ----------
  router.get('/me/privacy', auth, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { privacy_settings: true }
      });
      res.json(user?.privacy_settings || {});
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- PATCH /users/me/privacy ----------
  router.patch('/me/privacy', auth, async (req, res) => {
    const { online_status_visible, profile_visible, show_age, show_location } = req.body;
    try {
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          privacy_settings: {
            online_status_visible: online_status_visible ?? true,
            profile_visible: profile_visible ?? true,
            show_age: show_age ?? true,
            show_location: show_location ?? true
          }
        }
      });
      res.json({ success: true, privacy_settings: updated.privacy_settings });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /users/block ----------
  router.post('/block', auth, async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    try {
      if (userId === req.user.id) {
        return res.status(400).json({ error: 'You cannot block yourself' });
      }
      const existing = await prisma.block.findUnique({
        where: {
          blocker_id_blocked_id: { blocker_id: req.user.id, blocked_id: userId }
        }
      });
      if (existing) {
        return res.status(400).json({ error: 'User already blocked' });
      }
      await prisma.block.create({
        data: { blocker_id: req.user.id, blocked_id: userId }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- POST /users/report ----------
  router.post('/report', auth, async (req, res) => {
    const { userId, category, description } = req.body;
    if (!userId || !category) {
      return res.status(400).json({ error: 'userId and category are required' });
    }
    try {
      await prisma.report.create({
        data: {
          reporter_id: req.user.id,
          reported_id: userId,
          target_type: 'user',
          category,
          description: description || null
        }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- DELETE /users/me (soft delete) ----------
  router.delete('/me', auth, async (req, res) => {
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { is_active: false }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- GET /users/me/followers ----------
  router.get('/me/followers', auth, async (req, res) => {
    try {
      const followers = await prisma.follow.findMany({
        where: { following_id: req.user.id },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              display_name: true,
              profile_photo: true
            }
          }
        }
      });
      res.json({
        followers: followers.map(f => f.follower)
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- GET /users/me/following ----------
  router.get('/me/following', auth, async (req, res) => {
    try {
      const following = await prisma.follow.findMany({
        where: { follower_id: req.user.id },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              display_name: true,
              profile_photo: true
            }
          }
        }
      });
      res.json({
        following: following.map(f => f.following)
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- GET /users/me/blocks ----------
  router.get('/me/blocks', auth, async (req, res) => {
    try {
      const blocks = await prisma.block.findMany({
        where: { blocker_id: req.user.id },
        include: {
          blocked: {
            select: {
              id: true,
              username: true,
              display_name: true,
              profile_photo: true
            }
          }
        }
      });
      res.json({
        blocks: blocks.map(b => b.blocked)
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /users/me/unblock ----------
  router.post('/me/unblock', auth, async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    try {
      await prisma.block.delete({
        where: {
          blocker_id_blocked_id: { blocker_id: req.user.id, blocked_id: userId }
        }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- POST /users/me/photos (upload profile photo) ----------
  router.post('/me/photos', auth, upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      // In production, upload to S3 or cloud storage.
      // For now, we'll just return a mock URL.
      // TODO: Replace with actual file upload logic (e.g., AWS S3, Cloudinary, etc.)
      const mockUrl = `https://storage.amoramatch.one/users/${req.user.id}/profile_${Date.now()}.jpg`;
      
      await prisma.user.update({
        where: { id: req.user.id },
        data: { profile_photo: mockUrl }
      });
      res.json({ url: mockUrl });
    } catch (e) {
      console.error('Photo upload error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  return router;
};
