'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Star, Zap, Eye, Globe, Crown, Check, Sparkles,
  CreditCard, Bitcoin, Apple, Play, ArrowRight, Shield
} from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Basic dating experience',
    features: [
      'Limited daily likes (5)',
      'Basic matching',
      'Text chat with matches',
      'Profile creation',
    ],
    notIncluded: [
      'See who liked you',
      'Advanced filters',
      'Read receipts',
      'Profile boost',
      'Incognito mode',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    name: 'Plus',
    price: 9.99,
    period: 'month',
    description: 'Enhanced dating experience',
    features: [
      'Unlimited likes',
      'See who liked you',
      'Advanced filters',
      'Read receipts',
      '5 Super Likes per day',
      '1 Boost per month',
      'Priority support',
    ],
    notIncluded: [
      'Incognito mode',
      'Travel mode',
      'Video chat',
    ],
    cta: 'Upgrade to Plus',
    popular: true,
  },
  {
    name: 'Premium',
    price: 19.99,
    period: 'month',
    description: 'The ultimate experience',
    features: [
      'Everything in Plus',
      'AI compatibility insights',
      'Video chat',
      'Unlimited Super Likes',
      'Weekly Boosts',
      'Incognito mode',
      'Travel mode',
      'Profile verification badge',
      'Exclusive events access',
    ],
    notIncluded: [],
    cta: 'Go Premium',
    popular: false,
  },
];

const paymentMethods = [
  { id: 'apple', name: 'Apple Pay', icon: Apple },
  { id: 'google', name: 'Google Pay', icon: Play },
  { id: 'paypal', name: 'PayPal', icon: CreditCard },
  { id: 'crypto', name: 'Crypto', icon: Bitcoin },
];

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState('Plus');
  const [paymentMethod, setPaymentMethod] = useState('apple');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-midnight-950/90 backdrop-blur-xl border-b border-midnight-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/profile" className="p-2 -ml-2 hover:bg-midnight-800 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
          <h1 className="font-bold text-lg">Premium</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unlock Your Full Potential</h2>
          <p className="text-sm text-midnight-400">Get more matches, better connections, and premium features</p>
        </div>

        {/* Plans */}
        <div className="space-y-4 mb-8">
          {plans.map((plan) => (
            <motion.button
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                selectedPlan === plan.name
                  ? 'border-amora-500 bg-amora-500/5'
                  : 'border-midnight-800 bg-midnight-900 hover:border-midnight-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    {plan.popular && (
                      <span className="bg-amora-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-midnight-400">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-xs text-midnight-400">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-midnight-500">
                    <div className="w-4 h-4 rounded-full border border-midnight-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  paymentMethod === method.id
                    ? 'border-amora-500 bg-amora-500/5'
                    : 'border-midnight-800 bg-midnight-900 hover:border-midnight-700'
                }`}
              >
                <method.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subscribe Button */}
        <button
          onClick={handleSubscribe}
          disabled={isProcessing || selectedPlan === 'Free'}
          className="w-full gold-button py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {selectedPlan === 'Free' ? 'Current Plan' : `Subscribe to ${selectedPlan}`}
            </>
          )}
        </button>

        <p className="text-center text-xs text-midnight-500 mt-4">
          Cancel anytime. Subscription auto-renews. See Terms & Privacy.
        </p>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-midnight-800">
          <div className="flex items-center gap-1.5 text-xs text-midnight-400">
            <Shield className="w-4 h-4" />
            Secure Payment
          </div>
          <div className="flex items-center gap-1.5 text-xs text-midnight-400">
            <Zap className="w-4 h-4" />
            Instant Access
          </div>
          <div className="flex items-center gap-1.5 text-xs text-midnight-400">
            <Heart className="w-4 h-4" />
            30-Day Guarantee
          </div>
        </div>
      </div>
    </div>
  );
}
