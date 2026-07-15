'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Camera, Edit3, MapPin, Briefcase, GraduationCap,
  Wine, Cigarette, Music, Book, Plane, Dumbbell, Palette,
  Settings, Shield, Star, ChevronRight, Plus, X, Check
} from 'lucide-react';
import Link from 'next/link';

const interests = [
  { name: 'Photography', icon: Camera },
  { name: 'Travel', icon: Plane },
  { name: 'Music', icon: Music },
  { name: 'Reading', icon: Book },
  { name: 'Fitness', icon: Dumbbell },
  { name: 'Art', icon: Palette },
  { name: 'Wine', icon: Wine },
];

const photos = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop',
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Sophia',
    lastName: 'Anderson',
    age: 26,
    bio: 'Art curator by day, salsa dancer by night. Looking for someone who appreciates both fine wine and street tacos. Passionate about capturing emotions through my lens.',
    location: 'New York, NY',
    occupation: 'Art Curator',
    education: "Master's in Art History",
    height: "5'7\"",   // ✅ Fixed: escaped double quote
    bodyType: 'Athletic',
    religion: 'Spiritual',
    politics: 'Liberal',
    smoking: 'Never',
    drinking: 'Socially',
    relationshipGoal: 'Serious Relationship',
    personalityType: 'ENFP',
    loveLanguage: 'Quality Time',
  });

  return (
    <div className="min-h-screen bg-midnight-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-midnight-950/90 backdrop-blur-xl border-b border-midnight-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg">My Profile</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 hover:bg-midnight-800 rounded-lg transition-colors"
            >
              {isEditing ? <Check className="w-5 h-5 text-emerald-400" /> : <Edit3 className="w-5 h-5" />}
            </button>
            <Link href="/settings" className="p-2 hover:bg-midnight-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Photos */}
        <div className="relative">
          <div className="flex gap-2 p-4 overflow-x-auto hide-scrollbar">
            {photos.map((photo, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-32 h-40 object-cover rounded-2xl"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-amora-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Main
                  </div>
                )}
                {isEditing && (
                  <button className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}
            <button className="flex-shrink-0 w-32 h-40 bg-midnight-800 border-2 border-dashed border-midnight-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-amora-500 transition-colors">
              <Plus className="w-6 h-6 text-midnight-500" />
              <span className="text-xs text-midnight-500">Add Photo</span>
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-24">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}, {profile.age}</h2>
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium">
              <Shield className="w-3 h-3" />
              Verified
            </div>
          </div>

          <div className="flex items-center gap-1 text-midnight-400 text-sm mb-4">
            <MapPin className="w-4 h-4" />
            {profile.location}
          </div>

          {/* Compatibility Score */}
          <div className="bg-gradient-to-r from-amora-500/10 to-purple-500/10 border border-amora-500/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-midnight-400">Profile Completion</p>
                <p className="text-2xl font-bold gradient-text">85%</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-amora-500/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-amora-400" />
              </div>
            </div>
            <div className="mt-3 h-2 bg-midnight-800 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-amora-gradient rounded-full" />
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">About Me</h3>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-midnight-900 border border-midnight-700 rounded-xl p-3 text-sm focus:outline-none focus:border-amora-500 transition-all resize-none"
                rows={4}
              />
            ) : (
              <p className="text-sm text-midnight-300 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Work', value: profile.occupation, icon: Briefcase },
              { label: 'Education', value: profile.education, icon: GraduationCap },
              { label: 'Height', value: profile.height, icon: null },
              { label: 'Body Type', value: profile.bodyType, icon: null },
              { label: 'Religion', value: profile.religion, icon: null },
              { label: 'Politics', value: profile.politics, icon: null },
              { label: 'Smoking', value: profile.smoking, icon: Cigarette },
              { label: 'Drinking', value: profile.drinking, icon: Wine },
            ].map((item) => (
              <div key={item.label} className="bg-midnight-900 border border-midnight-800 rounded-xl p-3">
                <p className="text-xs text-midnight-500 mb-1">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Looking For */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Looking For</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 bg-amora-500/10 border border-amora-500/20 text-amora-400 rounded-full text-sm font-medium">
                {profile.relationshipGoal}
              </span>
            </div>
          </div>

          {/* Personality */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Personality</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-midnight-900 border border-midnight-800 rounded-xl p-3">
                <p className="text-xs text-midnight-500 mb-1">Type</p>
                <p className="text-sm font-medium">{profile.personalityType}</p>
              </div>
              <div className="bg-midnight-900 border border-midnight-800 rounded-xl p-3">
                <p className="text-xs text-midnight-500 mb-1">Love Language</p>
                <p className="text-sm font-medium">{profile.loveLanguage}</p>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest.name}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-midnight-900 border border-midnight-800 rounded-xl text-sm hover:border-amora-500/50 transition-colors cursor-pointer"
                >
                  <interest.icon className="w-4 h-4 text-amora-400" />
                  {interest.name}
                </span>
              ))}
            </div>
          </div>

          {/* Premium CTA */}
          <Link href="/premium" className="block bg-gradient-to-r from-gold-500/10 to-amora-500/10 border border-gold-500/20 rounded-2xl p-4 mb-6 hover:border-gold-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold gold-gradient-text">Upgrade to Premium</h3>
                <p className="text-xs text-midnight-400 mt-1">Get verified badge, see who liked you, and more</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gold-400" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
