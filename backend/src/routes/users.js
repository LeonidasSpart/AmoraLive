// backend/src/routes/users.js
const auth = require('../middleware/auth');
const { computeLevel } = require('../lib/xp');
const { incrementMissionProgress } = require('../lib/missions');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { UTApi } = require('uploadthing/server');
const { deleteUploadThingFile } = require('../lib/media');
const { logSecurityEvent } = require('../lib/security');
const { createRateLimiter } = require('../middleware/security');

function decryptOAuthToken(value) {
  if (!value) return null;
  const key = Buffer.from(String(process.env.OAUTH_TOKEN_ENCRYPTION_KEY || ''), 'hex');
  if (key.length !== 32) return null;
  try {
    const [ivRaw, tagRaw, encryptedRaw] = String(value).split('.');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivRaw, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

function createAppleClientSecret(clientId) {
  const privateKey = String(process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!privateKey || !process.env.APPLE_TEAM_ID || !process.env.APPLE_KEY_ID) return null;
  return jwt.sign(
    { iss: process.env.APPLE_TEAM_ID, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 5 * 60, aud: 'https://appleid.apple.com', sub: clientId },
    privateKey,
    { algorithm: 'ES256', keyid: process.env.APPLE_KEY_ID }
  );
}

async function revokeAppleRefreshToken(refreshToken) {
  if (!refreshToken) return;
  const clientId = process.env.APPLE_NATIVE_CLIENT_ID || 'one.amoramatch.app';
  const clientSecret = createAppleClientSecret(clientId);
  if (!clientSecret) return;
  await fetch('https://appleid.apple.com/auth/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      token: refreshToken,
      token_type_hint: 'refresh_token'
    })
  }).catch(() => {});
}

// Media storage is UploadThing (not AWS S3) — one API token, no IAM
// policies or permission boundaries to manage. UTApi reads
// UPLOADTHING_TOKEN from the environment automatically.
const utapi = process.env.UPLOADTHING_TOKEN ? new UTApi() : null;
const passwordRateLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 10, keyPrefix: 'password' });

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
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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

      // Profile-completion mission: bio + photo + at least one interest.
      // Photo upload happens on a different endpoint, so this checks the
      // current stored state after this update, not just what was just
      // submitted in this particular request.
      if (updated.bio && updated.profile_photo && updated.interests?.length > 0) {
        prisma.$transaction((tx) => incrementMissionProgress(tx, req.user.id, 'profile_completed', 1))
          .catch(err => console.error('Mission progress (profile_completed) failed:', err.message));
      }

      res.json(safeUser);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---------- GET /users/:userId (public profile view) ----------
  // Was previously missing entirely — chat/[userId].jsx has always called
  // this to load the other person's name/photo, and it 404'd every time.
  router.get('/:userId', auth, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.userId },
        select: {
          id: true,
          username: true,
          display_name: true,
          bio: true,
          profile_photo: true,
          cover_photo: true,
          online_status: true,
          is_verified: true,
          membership_tier: true,
          level: true,
          badges: true,
          location: true,
          interests: true,
          is_active: true,
          created_at: true
        }
      });
      if (!user || !user.is_active) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Cheap, valuable to know from a profile view: are they live right
      // now, and where — powers a "Watch Live" button instead of making
      // the visitor separately go check Discover.
      const [liveRoom, followerCount] = await Promise.all([
        prisma.liveRoom.findFirst({
          where: { host_id: req.params.userId, status: 'live' },
          select: { id: true }
        }),
        prisma.follow.count({ where: { following_id: req.params.userId } })
      ]);

      res.json({ ...user, isLive: !!liveRoom, liveRoomId: liveRoom?.id || null, followerCount });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // ---------- GET /users/:userId/gifts (gifts received — public gift wall) ----------
  router.get('/:userId/gifts', auth, async (req, res) => {
    const { limit = 30 } = req.query;
    try {
      const gifts = await prisma.giftTransaction.findMany({
        where: { receiver_id: req.params.userId, status: 'completed' },
        orderBy: { created_at: 'desc' },
        take: Math.min(Number(limit) || 30, 100),
        include: {
          gift: true,
          sender: { select: { id: true, username: true, display_name: true, profile_photo: true, is_verified: true, membership_tier: true } }
        }
      });
      const totalReceived = gifts.reduce((sum, g) => sum + g.coin_cost, 0);
      res.json({ gifts, totalReceived });
    } catch (e) {
      res.status(500).json({ error: e.message, code: 'USER_GIFTS_LOAD_FAILED' });
    }
  });

  // ---------- POST /users/me/change-password ----------
  // Kept for web/admin compatibility. The security behavior matches
  // /auth/change-password: stronger minimum, bcrypt hashing, session
  // revocation and security audit logging.
  router.post('/me/change-password', passwordRateLimiter, auth, async (req, res) => {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (newPassword.length < 10) {
      return res.status(400).json({ error: 'New password must be at least 10 characters' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ error: 'Choose a different password' });
    }
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { password_hash: true } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        await logSecurityEvent(prisma, { userId: req.user.id, action: 'password_change_failed', targetType: 'user', targetId: req.user.id, details: { reason: 'invalid_current_password', requestId: req.requestId }, ip: req.clientIp });
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.$transaction([
        prisma.user.update({ where: { id: req.user.id }, data: { password_hash: hashed } }),
        prisma.session.deleteMany({ where: { user_id: req.user.id } })
      ]);
      await logSecurityEvent(prisma, { userId: req.user.id, action: 'password_changed', targetType: 'user', targetId: req.user.id, details: { requestId: req.requestId, sessionsRevoked: true }, ip: req.clientIp });
      res.json({ success: true, message: 'Password updated successfully. Please sign in again.', sessionsRevoked: true });
    } catch (e) {
      console.error('Password update error:', e);
      res.status(500).json({ error: 'Unable to change password' });
    }
  });

  // ---------- GET /users/me/xp-progress ----------
  router.get('/me/xp-progress', auth, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { xp: true, level: true, badges: true } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      const progress = computeLevel(user.xp);
      res.json({
        xp: user.xp,
        level: user.level,
        badges: user.badges,
        xpIntoLevel: progress.xpIntoLevel,
        xpForNextLevel: progress.xpForNextLevel,
        progressPct: progress.progressPct
      });
    } catch (e) {
      res.status(500).json({ error: e.message, code: 'XP_PROGRESS_FAILED' });
    }
  });

  // ---------- GET /users/me/xp-history ----------
  router.get('/me/xp-history', auth, async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    try {
      const history = await prisma.xpTransaction.findMany({
        where: { user_id: req.user.id },
        orderBy: { created_at: 'desc' },
        take: limit
      });
      res.json(history);
    } catch (e) {
      res.status(500).json({ error: e.message, code: 'XP_HISTORY_FAILED' });
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
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // ---------- PATCH /users/me/privacy ----------
  router.patch('/me/privacy', auth, async (req, res) => {
    const { online_status_visible, profile_visible, show_age, show_location } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { privacy_settings: true }
      });
      const current = existingUser?.privacy_settings || {};

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          privacy_settings: {
            online_status_visible: online_status_visible ?? current.online_status_visible ?? true,
            profile_visible: profile_visible ?? current.profile_visible ?? true,
            show_age: show_age ?? current.show_age ?? true,
            show_location: show_location ?? current.show_location ?? true
          }
        }
      });
      res.json({ success: true, privacy_settings: updated.privacy_settings });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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

  // ---------- Push notification token registration ----------
  router.post('/me/push-token', auth, async (req, res) => {
    const token = String(req.body.token || '').trim();
    const platform = ['ios', 'android'].includes(req.body.platform) ? req.body.platform : null;
    if (!token || !platform) return res.status(400).json({ error: 'token and platform ("ios" or "android") are required.' });

    try {
      // A token can move between accounts (shared device, different
      // login) — upsert on the token itself rather than on (user,
      // platform), so re-registering always points it at whoever is
      // currently logged in on that device.
      await prisma.pushToken.upsert({
        where: { token },
        create: { user_id: req.user.id, token, platform },
        update: { user_id: req.user.id, platform }
      });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Unable to register push token.' });
    }
  });

  router.delete('/me/push-token', auth, async (req, res) => {
    const token = String(req.body.token || '').trim();
    if (!token) return res.status(400).json({ error: 'token is required.' });
    try {
      await prisma.pushToken.deleteMany({ where: { token, user_id: req.user.id } });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Unable to remove push token.' });
    }
  });

  // ---------- DELETE /users/me (soft delete) ----------
  router.delete('/me', auth, async (req, res) => {
    try {
      const current = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, profile_photo: true, cover_photo: true }
      });
      const appleIdentity = await prisma.oAuthAccount.findFirst({
        where: { user_id: req.user.id, provider: 'apple' },
        select: { refresh_token_encrypted: true }
      });
      if (!current) return res.status(404).json({ error: 'Account not found.' });

      const suffix = crypto.randomBytes(8).toString('hex');
      await revokeAppleRefreshToken(decryptOAuthToken(appleIdentity?.refresh_token_encrypted));
      await prisma.$transaction(async tx => {
      await tx.storyReaction.deleteMany({ where: { OR: [{ user_id: req.user.id }, { story: { user_id: req.user.id } }] } });
      await tx.storyView.deleteMany({ where: { OR: [{ viewer_id: req.user.id }, { story: { user_id: req.user.id } }] } });
      await tx.story.deleteMany({ where: { user_id: req.user.id } });
      await tx.message.deleteMany({ where: { OR: [{ sender_id: req.user.id }, { receiver_id: req.user.id }] } });
      await tx.callHistory.deleteMany({ where: { OR: [{ caller_id: req.user.id }, { receiver_id: req.user.id }] } });
      await tx.videoMatchSession.deleteMany({ where: { OR: [{ user_a_id: req.user.id }, { user_b_id: req.user.id }] } });
      await tx.follow.deleteMany({ where: { OR: [{ follower_id: req.user.id }, { following_id: req.user.id }] } });
      await tx.match.deleteMany({ where: { OR: [{ user1_id: req.user.id }, { user2_id: req.user.id }] } });
      await tx.swipe.deleteMany({ where: { OR: [{ swiper_id: req.user.id }, { target_id: req.user.id }] } });
      await tx.block.deleteMany({ where: { OR: [{ blocker_id: req.user.id }, { blocked_id: req.user.id }] } });
      await tx.mute.deleteMany({ where: { OR: [{ muter_id: req.user.id }, { muted_id: req.user.id }] } });
      await tx.roomParticipant.deleteMany({ where: { user_id: req.user.id } });
      await tx.liveChatMessage.deleteMany({ where: { user_id: req.user.id } });
      await tx.notification.deleteMany({ where: { user_id: req.user.id } });
      await tx.dailyRewardStatus.deleteMany({ where: { user_id: req.user.id } });
      await tx.dailyRewardClaim.deleteMany({ where: { user_id: req.user.id } });
      await tx.xpTransaction.deleteMany({ where: { user_id: req.user.id } });
      await tx.missionProgress.deleteMany({ where: { user_id: req.user.id } });
      await tx.userCosmetic.deleteMany({ where: { user_id: req.user.id } });
      await tx.eventScore.deleteMany({ where: { user_id: req.user.id } });
        await tx.session.deleteMany({ where: { user_id: req.user.id } });
        await tx.oAuthAccount.deleteMany({ where: { user_id: req.user.id } });
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            email: `deleted-${suffix}@deleted.amora.live`,
            username: `deleted_${suffix}`,
            display_name: 'Deleted User',
            password_hash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12),
            bio: null,
            location: null,
            interests: [],
            languages: [],
            relationship_intent: null,
            gender: null,
            profile_photo: null,
            cover_photo: null,
            online_status: 'offline',
            privacy_settings: null,
            dating_preferences: null,
            notification_preferences: null,
            is_active: false,
            deleted_at: new Date()
          }
        });
      });

      await Promise.all(
        [current.profile_photo, current.cover_photo]
          .filter(Boolean)
          .map(url => deleteUploadThingFile(utapi, url).catch(() => null))
      );

      res.json({ success: true });
    } catch (e) {
      console.error('Account deletion error:', e);
      res.status(400).json({ error: 'Unable to delete the account.' });
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
              profile_photo: true,
              is_verified: true,
              membership_tier: true
            }
          }
        }
      });
      res.json({
        followers: followers.map(f => f.follower)
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
              profile_photo: true,
              is_verified: true,
              membership_tier: true
            }
          }
        }
      });
      res.json({
        following: following.map(f => f.following)
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  // Follow/unfollow was previously entirely missing — /users/me/followers,
  // /users/me/following, and the Discover ?following=true filter all
  // existed and worked, but there was no way to ever actually follow
  // someone in the first place.
  router.post('/:userId/follow', auth, async (req, res) => {
    const { userId } = req.params;
    if (userId === req.user.id) return res.status(400).json({ error: 'You cannot follow yourself.' });
    try {
      const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, is_active: true } });
      if (!target || !target.is_active) return res.status(404).json({ error: 'User not found' });

      await prisma.follow.upsert({
        where: { follower_id_following_id: { follower_id: req.user.id, following_id: userId } },
        update: {},
        create: { follower_id: req.user.id, following_id: userId }
      });

      await prisma.notification.create({
        data: { user_id: userId, type: 'new_follower', payload: { followerId: req.user.id } }
      }).catch(err => console.error('Failed to create follow notification:', err.message));

      prisma.$transaction((tx) => incrementMissionProgress(tx, req.user.id, 'follows_made', 1))
        .catch(err => console.error('Mission progress (follows_made) failed:', err.message));

      const count = await prisma.follow.count({ where: { following_id: userId, follower: { deleted_at: null } } });
      res.json({ following: true, followerCount: count });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.post('/:userId/unfollow', auth, async (req, res) => {
    const { userId } = req.params;
    try {
      await prisma.follow.deleteMany({ where: { follower_id: req.user.id, following_id: userId } });
      const count = await prisma.follow.count({ where: { following_id: userId, follower: { deleted_at: null } } });
      res.json({ following: false, followerCount: count });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  router.get('/:userId/follow-status', auth, async (req, res) => {
    const { userId } = req.params;
    try {
      const [isFollowing, followerCount] = await Promise.all([
        prisma.follow.findUnique({ where: { follower_id_following_id: { follower_id: req.user.id, following_id: userId } } }),
        prisma.follow.count({ where: { following_id: userId, follower: { deleted_at: null } } })
      ]);
      res.json({ following: Boolean(isFollowing), followerCount });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
              profile_photo: true,
              is_verified: true,
              membership_tier: true
            }
          }
        }
      });
      res.json({
        blocks: blocks.map(b => b.blocked)
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
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
      if (!utapi) {
        return res.status(503).json({ error: 'Media storage is not configured' });
      }
      const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
      const filename = `${req.user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      // Node 18+ has File/Blob globally (via undici) — no extra dependency
      // needed to wrap the multer buffer for UploadThing's SDK.
      const file = new File([req.file.buffer], filename, { type: req.file.mimetype });

      const result = await utapi.uploadFiles(file);
      if (result.error) {
        throw new Error(result.error.message || 'Upload failed');
      }
      // ufsUrl is UploadThing's current CDN-backed URL field; older SDK
      // versions only returned `url`, so fall back to it if present.
      const url = result.data.ufsUrl || result.data.url;

      // Fetch the old photo before overwriting so it can be cleaned up
      // from UploadThing after — otherwise every re-upload just leaves
      // the previous file orphaned there forever.
      const before = await prisma.user.findUnique({ where: { id: req.user.id }, select: { profile_photo: true } });

      await prisma.user.update({ where: { id: req.user.id }, data: { profile_photo: url } });

      if (before?.profile_photo && before.profile_photo !== url) {
        deleteUploadThingFile(utapi, before.profile_photo);
      }

      const current = await prisma.user.findUnique({ where: { id: req.user.id }, select: { bio: true, interests: true } });
      if (current?.bio && current.interests?.length > 0) {
        prisma.$transaction((tx) => incrementMissionProgress(tx, req.user.id, 'profile_completed', 1))
          .catch(err => console.error('Mission progress (profile_completed) failed:', err.message));
      }

      res.json({ url });
    } catch (e) {
      console.error('Photo upload error:', e);
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  });

  return router;
};
