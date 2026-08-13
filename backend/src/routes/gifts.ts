import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/catalog', authenticate, async (req, res) => {
  // Hardcoded or from DB
  const gifts = [
    { id: 'g1', name: 'Rose', cost: 10 },
    { id: 'g2', name: 'Teddy', cost: 25 },
    { id: 'g3', name: 'Diamond', cost: 100 },
  ];
  res.json(gifts);
});

router.post('/send', authenticate, async (req: AuthRequest, res) => {
  const { giftId, receiverId } = req.body;
  // Validate, deduct coins, create transaction
  res.json({ success: true });
});

export default router;
