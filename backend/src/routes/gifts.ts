import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/catalog', authenticate, async (req, res) => {
  const gifts = [
    { id: 'g1', name: 'Rose', cost: 10 },
    { id: 'g2', name: 'Teddy', cost: 25 },
    { id: 'g3', name: 'Diamond', cost: 100 },
  ];
  res.json(gifts);
});

router.post('/send', authenticate, async (req: AuthRequest, res) => {
  // Implement gift sending logic with coin deduction
  res.json({ success: true });
});

export default router;
