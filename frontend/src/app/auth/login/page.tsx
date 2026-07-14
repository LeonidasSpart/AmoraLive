'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Eye, EyeOff, Mail, Lock, ArrowRight, Chrome, Apple } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        router.push('/auth/2fa');
      } else {
        router.push('/discover');
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-midnight-400">Sign in to continue your journey</p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-midnight-900 border border-midnight-700 rounded-xl py-3 pl-10 pr-12 text-sm focus:outline-none focus:border-amora-500 focus:ring-1 focus:ring-amora-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-midnight-600 bg-midnight-900 text-amora-500 focus:ring-amora-500" />
                <span className="text-midnight-400">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-amora-400 hover:text-amora-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {formError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full amora-button py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-midnight-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-midnight-800 text-midnight-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-midnight-900 border border-midnight-700 rounded-xl hover:bg-midnight-800 transition-colors text-sm">
                <Chrome className="w-5 h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-midnight-900 border border-midnight-700 rounded-xl hover:bg-midnight-800 transition-colors text-sm">
                <Apple className="w-5 h-5" />
                Apple
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-midnight-400">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-amora-400 hover:text-amora-300 font-medium">
            Get Started
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
