'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Star, MapPin, MessageCircle, Shield, Sparkles, RotateCcw, Info, Loader2 } from 'lucide-react';
import { matchingApi, DiscoverCandidate } from '../../lib/api';

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<DiscoverCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchToast, setMatchToast] = useState<string | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  const nopeOpacity = useTransform(x, [-300, -100, 0, 100, 300], [1, 0, 0, 0, 0]);
  const likeOpacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 0, 0, 0, 1]);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchingApi.getRecommendations(10);
      setProfiles(data);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Could not load recommendations. Complete your profile and preferences first.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = useCallback(
    async (dir: 'left' | 'right' | 'super') => {
      if (!currentProfile) return;
      setDirection(dir === 'super' ? 'right' : dir);

      try {
        if (dir === 'left') {
          await matchingApi.pass(currentProfile.id);
        } else {
          const result = await matchingApi.like(currentProfile.id, dir === 'super' ? 'SUPERLIKE' : 'LIKE');
          if (result.matched) {
            setMatchToast(`You matched with ${currentProfile.profile.firstName}!`);
            setTimeout(() => setMatchToast(null), 3000);
          }
        }
      } catch {
        // Non-fatal: still advance the stack even if the network call fails,
        // so the UI never gets stuck on a bad connection.
      }

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
        x.set(0);
      }, 300);
    },
    [currentProfile, x],
  );

  const handleDragEnd = useCallback(
    (_: any, info: any) => {
      if (info.offset.x > 150) handleSwipe('right');
      else if (info.offset.x < -150) handleSwipe('left');
    },
    [handleSwipe],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amora-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
          <p className="text-midnight-400 mb-6">{error}</p>
          <button onClick={loadRecommendations} className="amora-button flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-midnight-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-amora-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-amora-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're All Caught Up!</h2>
          <p className="text-midnight-400 mb-6">Check back later for more matches.</p>
          <button onClick={loadRecommendations} className="amora-button flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>
    );
  }

  const photo = currentProfile.profile.photos[0] || '/placeholder-avatar.png';
  const displayName = currentProfile.profile.displayName || currentProfile.profile.firstName;
  const location = [currentProfile.profile.city, currentProfile.profile.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-midnight-950">
      {matchToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amora-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          {matchToast}
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 bg-midnight-950/90 backdrop-blur-xl border-b border-midnight-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amora-gradient rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold">Amora</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-midnight-800 rounded-lg transition-colors">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </button>
            <button className="p-2 hover:bg-midnight-800 rounded-lg transition-colors relative">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amora-500 rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16 pb-24 px-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentProfile.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
              rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <motion.div
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              className="relative rounded-3xl overflow-hidden bg-midnight-900 shadow-2xl cursor-grab active:cursor-grabbing"
            >
              <div className="relative aspect-[3/4]">
                <img src={photo} alt={displayName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/20 to-transparent" />

                <div className="absolute top-4 right-4 bg-amora-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> {currentProfile.compatibility.overallScore}% Match
                </div>

                {currentProfile.profile.verified && (
                  <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Verified
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-bold">
                    {displayName}
                    {currentProfile.profile.age ? `, ${currentProfile.profile.age}` : ''}
                  </h2>
                  {location && (
                    <div className="flex items-center gap-1 text-midnight-300 text-sm mt-1">
                      <MapPin className="w-4 h-4" /> {location}
                      {currentProfile.distanceKm !== null && ` · ${Math.round(currentProfile.distanceKm)} km away`}
                    </div>
                  )}
                  {currentProfile.profile.bio && (
                    <p className="text-sm text-midnight-200 leading-relaxed line-clamp-3 mt-2">
                      {currentProfile.profile.bio}
                    </p>
                  )}
                  {currentProfile.compatibility.factors?.sharedInterests > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white">
                        {currentProfile.compatibility.factors.sharedInterests} shared interests
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 left-8 border-4 border-red-500 text-red-500 font-bold text-3xl px-4 py-2 rounded-xl rotate-[-20deg] pointer-events-none"
            >
              NOPE
            </motion.div>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 right-8 border-4 border-emerald-500 text-emerald-500 font-bold text-3xl px-4 py-2 rounded-xl rotate-[20deg] pointer-events-none"
            >
              LIKE
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 bg-midnight-800 border border-midnight-700 rounded-full flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleSwipe('super')}
            className="w-12 h-12 bg-midnight-800 border border-midnight-700 rounded-full flex items-center justify-center hover:bg-gold-500/10 hover:border-gold-500/50 hover:text-gold-500 transition-all active:scale-95"
          >
            <Star className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 bg-midnight-800 border border-midnight-700 rounded-full flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-500 transition-all active:scale-95"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-midnight-950/90 backdrop-blur-xl border-t border-midnight-800">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-around">
          <button className="p-2 text-amora-500">
            <Heart className="w-6 h-6" />
          </button>
          <button className="p-2 text-midnight-500 hover:text-white transition-colors">
            <Star className="w-6 h-6" />
          </button>
          <button className="p-2 text-midnight-500 hover:text-white transition-colors">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="p-2 text-midnight-500 hover:text-white transition-colors">
            <Info className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}
