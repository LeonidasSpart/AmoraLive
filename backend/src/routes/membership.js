// backend/src/routes/membership.js
const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = require('express').Router();

  // ---------- GET /membership/plans ----------
  router.get('/plans', async (req, res) => {
    try {
      const plans = [
        {
          tier: 'free',
          label: 'Free',
          price: 0,
          currency: 'USD',
          benefits: [
            'Basic profile',
            'View live streams',
            'Send basic gifts',
            'Limited chat'
          ]
        },
        {
          tier: 'premium',
          label: 'Premium',
          price: 9.99,
          currency: 'USD',
          benefits: [
            'Ad-free experience',
            'Exclusive gifts',
            'Priority support',
            'Profile badge',
            'Extended chat history'
          ]
        },
        {
          tier: 'vip',
          label: 'VIP',
          price: 29.99,
          currency: 'USD',
          benefits: [
            'All Premium benefits',
            'Profile boost',
            'Bonus coins monthly',
            'Exclusive VIP events',
            'Private shows access'
          ]
        },
        {
          tier: 'svip',
          label: 'SVIP',
          price: 59.99,
          currency: 'USD',
          benefits: [
            'All VIP benefits',
            'Unlimited gifts',
            'Private 1-on-1 shows',
            'Early access to features',
            'Dedicated account manager'
          ]
        }
      ];
      res.json(plans);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- GET /membership/me ----------
  router.get('/me', auth, async (req, res) => {
    try {
      const membership = await prisma.membership.findUnique({
        where: { user_id: req.user.id }
      });
      
      if (!membership) {
        // Return free tier info if no membership
        return res.json({
          tier: 'free',
          label: 'Free',
          start_date: null,
          end_date: null,
          auto_renew: false
        });
      }
      
      // Get plan details
      const plans = await getPlans();
      const plan = plans.find(p => p.tier === membership.tier);
      
      res.json({
        ...membership,
        label: plan?.label || membership.tier,
        benefits: plan?.benefits || []
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /membership/subscribe ----------
  router.post('/subscribe', auth, async (req, res) => {
    const { tier, paymentMethodId } = req.body;
    if (!tier) {
      return res.status(400).json({ error: 'tier is required' });
    }
    
    const validTiers = ['premium', 'vip', 'svip'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    try {
      // Check if user already has a membership
      const existing = await prisma.membership.findUnique({
        where: { user_id: req.user.id }
      });

      // In production, process payment via Stripe here
      // For now, we'll create the membership directly
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      let membership;
      if (existing) {
        // Update existing membership (upgrade)
        membership = await prisma.membership.update({
          where: { user_id: req.user.id },
          data: {
            tier,
            start_date: startDate,
            end_date: endDate,
            auto_renew: true,
            stripe_subscription_id: 'mock_' + Date.now()
          }
        });
      } else {
        // Create new membership
        membership = await prisma.membership.create({
          data: {
            user_id: req.user.id,
            tier,
            start_date: startDate,
            end_date: endDate,
            auto_renew: true,
            stripe_subscription_id: 'mock_' + Date.now()
          }
        });
      }

      // Update user's membership_tier field
      await prisma.user.update({
        where: { id: req.user.id },
        data: { membership_tier: tier }
      });

      res.json({
        success: true,
        membership,
        message: `Successfully subscribed to ${tier} plan`
      });
    } catch (e) {
      console.error('Subscription error:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /membership/cancel ----------
  router.post('/cancel', auth, async (req, res) => {
    try {
      const existing = await prisma.membership.findUnique({
        where: { user_id: req.user.id }
      });

      if (!existing) {
        return res.status(400).json({ error: 'No active membership to cancel' });
      }

      // Cancel auto-renew but keep benefits until expiration
      const updated = await prisma.membership.update({
        where: { user_id: req.user.id },
        data: { auto_renew: false }
      });

      res.json({
        success: true,
        message: `Membership cancelled. You will have access until ${new Date(updated.end_date).toLocaleDateString()}`
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- POST /membership/upgrade ----------
  router.post('/upgrade', auth, async (req, res) => {
    const { tier } = req.body;
    if (!tier) {
      return res.status(400).json({ error: 'tier is required' });
    }

    const validTiers = ['premium', 'vip', 'svip'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    try {
      const existing = await prisma.membership.findUnique({
        where: { user_id: req.user.id }
      });

      if (!existing) {
        return res.status(400).json({ error: 'No active membership to upgrade' });
      }

      // Calculate prorated upgrade (in production, handle via Stripe)
      const newEndDate = new Date(existing.end_date);
      // Add 1 month from now (or keep existing end date if further)
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);
      const endDate = futureDate > newEndDate ? futureDate : newEndDate;

      const updated = await prisma.membership.update({
        where: { user_id: req.user.id },
        data: {
          tier,
          end_date: endDate,
          auto_renew: true
        }
      });

      // Update user's membership_tier field
      await prisma.user.update({
        where: { id: req.user.id },
        data: { membership_tier: tier }
      });

      res.json({
        success: true,
        membership: updated,
        message: `Successfully upgraded to ${tier} plan`
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---------- Helper: get plans ----------
  async function getPlans() {
    return [
      {
        tier: 'free',
        label: 'Free',
        price: 0,
        currency: 'USD',
        benefits: ['Basic profile', 'View live streams', 'Send basic gifts', 'Limited chat']
      },
      {
        tier: 'premium',
        label: 'Premium',
        price: 9.99,
        currency: 'USD',
        benefits: [
          'Ad-free experience',
          'Exclusive gifts',
          'Priority support',
          'Profile badge',
          'Extended chat history'
        ]
      },
      {
        tier: 'vip',
        label: 'VIP',
        price: 29.99,
        currency: 'USD',
        benefits: [
          'All Premium benefits',
          'Profile boost',
          'Bonus coins monthly',
          'Exclusive VIP events',
          'Private shows access'
        ]
      },
      {
        tier: 'svip',
        label: 'SVIP',
        price: 59.99,
        currency: 'USD',
        benefits: [
          'All VIP benefits',
          'Unlimited gifts',
          'Private 1-on-1 shows',
          'Early access to features',
          'Dedicated account manager'
        ]
      }
    ];
  }

  return router;
};
