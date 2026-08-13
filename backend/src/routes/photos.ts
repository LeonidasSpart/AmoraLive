import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Upload a photo
router.post('/upload', authenticate, upload.single('photo'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const key = `users/${req.user.id}/${Date.now()}_${req.file.originalname}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    })
  );

  const photoUrl = `${process.env.AWS_S3_BUCKET_URL}/${key}`;
  const photo = await prisma.photo.create({
    data: {
      userId: req.user.id,
      url: photoUrl,
      publicId: key, // store the S3 key for later deletion
      isPrimary: false,
    },
  });

  res.status(201).json(photo);
});

// Get all photos for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const photos = await prisma.photo.findMany({
    where: { userId: req.user.id },
    orderBy: { position: 'asc' },
  });
  res.json(photos);
});

// Delete a photo (also from S3)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
  if (!photo || photo.userId !== req.user.id) {
    return res.status(404).json({ message: 'Photo not found' });
  }

  if (photo.publicId) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: photo.publicId,
      })
    );
  }

  await prisma.photo.delete({ where: { id: photo.id } });
  res.json({ success: true });
});

// Set a photo as primary
router.patch('/:id/primary', authenticate, async (req: AuthRequest, res) => {
  const photo = await prisma.photo.findUnique({ where: { id: req.params.id } });
  if (!photo || photo.userId !== req.user.id) {
    return res.status(404).json({ message: 'Photo not found' });
  }

  await prisma.photo.updateMany({
    where: { userId: req.user.id },
    data: { isPrimary: false },
  });
  await prisma.photo.update({
    where: { id: photo.id },
    data: { isPrimary: true },
  });

  res.json({ success: true });
});

export default router;
