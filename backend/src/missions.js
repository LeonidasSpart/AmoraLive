// backend/src/data/missions.js
//
// Add a new mission by adding an entry here — the framework in
// src/lib/missions.js and src/routes/missions.js reads this catalog
// generically, so nothing else needs to change. `metric` must match one of
// the increment calls wired into the real actions (live.js, gifts.js,
// matches.js, messages.js, users.js, battles.js) — see src/lib/missions.js
// for the full list of metrics currently tracked.
//
// `type` controls how period_key resets:
//   'daily'    -> resets every UTC calendar day
//   'weekly'   -> resets every ISO week
//   'lifetime' -> never resets, one row forever
//
// `badge` (lifetime missions only) grants a permanent profile badge on
// claim, the same additive User.badges mechanism XP level-ups use.

const MISSIONS = [
  // ---- Daily ----
  { key: 'daily_go_live', type: 'daily', category: 'creator', metric: 'live_minutes', target: 30, title: 'Go live for 30 minutes', description: 'Stream for a total of 30 minutes today.', reward: { coins: 200, xp: 20 }, icon: '🔴' },
  { key: 'daily_send_gift', type: 'daily', category: 'viewer', metric: 'gifts_sent', target: 1, title: 'Send a gift', description: 'Send any gift to a creator.', reward: { coins: 50, xp: 10 }, icon: '🎁' },
  { key: 'daily_join_stream', type: 'daily', category: 'viewer', metric: 'streams_joined', target: 3, title: 'Watch 3 livestreams', description: 'Join 3 different live rooms.', reward: { coins: 50, xp: 10 }, icon: '📺' },
  { key: 'daily_send_messages', type: 'daily', category: 'general', metric: 'messages_sent', target: 5, title: 'Send 5 messages', description: 'Chat with someone — 5 messages today.', reward: { coins: 30, xp: 10 }, icon: '💬' },

  // ---- Weekly ----
  { key: 'weekly_receive_gifts', type: 'weekly', category: 'creator', metric: 'gifts_received', target: 5, title: 'Receive 5 gifts', description: 'Get 5 gifts from your supporters this week.', reward: { coins: 500, xp: 50 }, icon: '💝' },
  { key: 'weekly_battle', type: 'weekly', category: 'creator', metric: 'battles_participated', target: 1, title: 'Join a PK battle', description: 'Take part in a live battle this week.', reward: { coins: 300, xp: 40 }, icon: '⚔️' },
  { key: 'weekly_follow_creators', type: 'weekly', category: 'viewer', metric: 'follows_made', target: 3, title: 'Follow 3 creators', description: 'Follow 3 new creators this week.', reward: { coins: 150, xp: 20 }, icon: '➕' },
  { key: 'weekly_stream_hours', type: 'weekly', category: 'creator', metric: 'live_minutes', target: 180, title: 'Stream 3 hours this week', description: 'Total live time of 3 hours across the week.', reward: { coins: 1000, xp: 100 }, icon: '⏱️' },

  // ---- Lifetime (achievements) ----
  { key: 'life_first_gift_sent', type: 'lifetime', category: 'viewer', metric: 'gifts_sent', target: 1, title: 'First Gift', description: 'Send your very first gift.', reward: { coins: 100, xp: 20 }, badge: 'Generous Heart', icon: '🎁' },
  { key: 'life_first_gift_received', type: 'lifetime', category: 'creator', metric: 'gifts_received', target: 1, title: 'First Supporter', description: 'Receive your first gift.', reward: { coins: 100, xp: 20 }, badge: 'Fan Favorite', icon: '💝' },
  { key: 'life_first_match', type: 'lifetime', category: 'general', metric: 'matches_made', target: 1, title: 'First Match', description: 'Get your first mutual match.', reward: { coins: 100, xp: 20 }, badge: 'Matchmaker', icon: '❤️' },
  { key: 'life_profile_complete', type: 'lifetime', category: 'general', metric: 'profile_completed', target: 1, title: 'Complete Your Profile', description: 'Add a bio, photo, and interests.', reward: { coins: 200, xp: 30 }, badge: 'All Set Up', icon: '✅' },
  { key: 'life_ten_streams', type: 'lifetime', category: 'creator', metric: 'streams_started', target: 10, title: 'Regular Broadcaster', description: 'Go live 10 times.', reward: { coins: 500, xp: 60 }, badge: 'Regular Broadcaster', icon: '📡' },
  { key: 'life_hundred_gifts_sent', type: 'lifetime', category: 'viewer', metric: 'gifts_sent', target: 100, title: 'Big Spender', description: 'Send 100 gifts total.', reward: { coins: 2000, xp: 150 }, badge: 'Big Spender', icon: '💎' },
  { key: 'life_battle_veteran', type: 'lifetime', category: 'creator', metric: 'battles_participated', target: 25, title: 'Battle Veteran', description: 'Take part in 25 PK battles.', reward: { coins: 1500, xp: 120 }, badge: 'Battle Veteran', icon: '🗡️' }
];

module.exports = { MISSIONS };
