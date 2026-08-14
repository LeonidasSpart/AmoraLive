const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
    }
  },
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // In production, upload to S3/Cloudinary
    // For now, return a data URL (replace with actual upload logic)
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    // TODO: Upload to S3 using AWS SDK
    // const s3Url = await uploadToS3(req.file.buffer, `avatars/${req.user.id}/${uuidv4()}.jpg`);

    res.json({
      url: dataUrl, // Replace with actual S3 URL in production
      message: 'Avatar uploaded successfully',
    });
  } catch (err) {
    next(err);
  }
});

// Upload stream thumbnail
router.post('/thumbnail', authenticate, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json({
      url: dataUrl,
      message: 'Thumbnail uploaded successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
