'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', dateOfBirth: '', gender: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      router.push('/discover');
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
          'Could not create your account. Please check your details and try again.',
      );
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amora-500/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-amora-gradient rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold">Amora</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-8 bg-amora-500' : 'w-8 bg-midnight-700'}`} />
            ))}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {step === 1 && 'Create Your Account'}
            {step === 2 && 'Tell Us About You'}
            {step === 3 && 'Set Your Preferences'}
          </h1>
          <p className="text-midnight-400">
            {step === 1 && 'Start your journey to meaningful connections'}
            {step === 2 && 'Help us find your perfect match'}
            {step === 3 && 'Customize your dating experience'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
                      <input type="text" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)}
                        className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                        placeholder="John" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)}
                      className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                      placeholder="Doe" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
                    <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                      className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                      placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
                    <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                      placeholder="+1 (555) 000-0000" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateField('password', e.target.value)}
                      className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 pl-10 pr-12 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                      placeholder="Min 8 characters" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                    required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Male', 'Female', 'Non-Binary', 'Other'].map(gender => (
                      <button key={gender} type="button" onClick={() => updateField('gender', gender.toUpperCase())}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                          formData.gender === gender.toUpperCase()
                            ? 'border-amora-500 bg-amora-500/10 text-amora-400'
                            : 'border-midnight-700 bg-midnight-900 text-midnight-400 hover:border-midnight-600'
                        }`}>
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-midnight-400 text-center">You're all set! Click below to create your account and start matching.</p>
                <div className="flex items-center justify-center py-4">
                  <div className="w-20 h-20 bg-amora-500/10 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-amora-500 fill-amora-500 animate-heart-beat" />
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 px-4 bg-midnight-900 border border-midnight-700 rounded-xl text-sm font-medium hover:bg-midnight-800 transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button type="submit" disabled={isLoading}
                className="flex-1 amora-button py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 3 ? 'Create Account' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-midnight-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-amora-400 hover:text-amora-300 font-medium">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
