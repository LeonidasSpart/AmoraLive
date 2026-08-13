import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Gift catalog (hardcoded for now – can be moved to DB later)
const GIFT_CATALOG = [
  { id: 'g1', name: 'Rose', cost: 10, icon: '🌹' },
  { id: 'g2', name: 'Teddy', cost: 25, icon: '🧸' },
  { id: 'g3', name: 'Diamond', cost: 100, icon: '💎' },
  { id: 'g4', name: 'Heart', cost: 50, icon: '❤️' },
];

const sendGiftSchema = z.object({
  giftId: z.string().min(1),
  receiverId: z.string().min(1),
});

router.get('/catalog', authenticate, async (req: AuthRequest, res) => {
  res.json(GIFT_CATALOG);
});

router.post('/send', authenticate, async (req: AuthRequest, res) => {
  const parsed = sendGiftSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid gift data',
      errors: parsed.error.issues,
    });
  }

  const { giftId, receiverId } = parsed.data;

  // Find the gift in catalog
  const gift = GIFT_CATALOG.find(g => g.id === giftId);
  if (!gift) {
    return res.status(404).json({ message: 'Gift not found' });
  }

  // Check if sender has enough coins
  const sender = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { coins: true },
  });
  if (!sender || sender.coins < gift.cost) {
    return res.status(400).json({ message: 'Insufficient coins' });
  }

  // Deduct coins from sender
  await prisma.user.update({
    where: { id: req.user.id },
    data: { coins: { decrement: gift.cost } },
  });

  // (Optional) Create a transaction record – you'd need a Transaction model
  // For now, just notify the receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'GIFT',
      title: 'You received a gift!',
      body: `${req.user.displayName} sent you a ${gift.name} 🎁`,
    },
  });

  res.json({ success: true, gift });
});

export default router;
