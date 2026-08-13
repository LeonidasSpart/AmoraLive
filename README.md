# AMORA Live - Social Live Streaming App

A full-stack ready React Native live streaming social platform built with Expo. Features authentication, live streamer grid, virtual currency system, VIP tiers, and profile management.

## Screenshots

| Login | Live Grid | Profile | Settings |
|-------|-----------|---------|----------|
| Auth screen with secure storage | Party Room with live cards | Full profile with coins & menu | System preferences |

## Features

- **Authentication**: Login/Register with Zustand state management & AsyncStorage persistence
- **Live Streaming Grid**: "Party Room" with viewer counts, live badges, and streamer cards
- **Virtual Currency**: Diamond/coin system with recharge flow
- **VIP System**: Tier badges and privilege indicators
- **Profile Management**: Avatar, level system, ID display, menu navigation
- **Navigation**: Expo Router with tab-based layout
- **Settings**: Notifications, dark mode toggle, privacy, terms
- **Responsive UI**: Optimized for iOS & Android

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 51 |
| Navigation | Expo Router (file-based) |
| State | Zustand + AsyncStorage |
| Styling | React Native StyleSheet |
| Icons | @expo/vector-icons |
| Auth | Custom JWT-ready (mock backend) |

## Project Structure

```
livestream-app/
├── app/
│   ├── (auth)/           # Auth group (login, register)
│   ├── (tabs)/           # Main tabs (live, discover, create, messages, profile)
│   ├── settings/         # Settings modal
│   └── _layout.tsx       # Root layout with auth guards
├── components/           # Reusable components
├── constants/            # Theme colors
├── hooks/                # Zustand store
├── assets/               # Images & icons
├── package.json
├── app.json              # Expo config
└── tsconfig.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: macOS + Xcode (for simulator)
- Android: Android Studio + emulator

### Installation

```bash
cd livestream-app
npm install
```

### Run Development

```bash
# Start Expo
npx expo start

# iOS simulator
i

# Android emulator
a
```

## App Store Deployment

### iOS (App Store)

1. **Apple Developer Account**
   - Enroll at [developer.apple.com](https://developer.apple.com) ($99/year)

2. **Configure app.json**
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.amora.live",
       "buildNumber": "1.0.0"
     }
   }
   ```

3. **Build with EAS**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform ios
   ```

4. **App Store Connect**
   - Create app record in [App Store Connect](https://appstoreconnect.apple.com)
   - Upload build via Transporter or EAS Submit
   - Fill metadata, screenshots, privacy policy URL
   - Submit for review

**Required for approval:**
- [ ] Content moderation system (for UGC/live streams)
- [ ] Report/block user functionality
- [ ] Age rating: 17+ if live streaming
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] App Preview video (optional but recommended)

### Android (Google Play)

1. **Google Play Console**
   - Create account at [play.google.com/console](https://play.google.com/console) ($25 one-time)

2. **Configure app.json**
   ```json
   {
     "android": {
       "package": "com.amora.live",
       "versionCode": 1
     }
   }
   ```

3. **Build AAB**
   ```bash
   eas build --platform android
   ```

4. **Upload to Play Console**
   - Create new app → Upload AAB
   - Fill store listing (screenshots, description)
   - Set content rating (answer questionnaire)
   - Configure pricing & distribution
   - Submit for review

**Required for approval:**
- [ ] Content moderation for live streams
- [ ] Data safety form (what data you collect)
- [ ] Privacy policy
- [ ] Target API level 34+

## Backend Integration

The app uses a mock auth system. To connect to a real backend:

1. Replace `hooks/useAuthStore.ts` login/register with API calls:
```typescript
const response = await fetch('https://api.amoramatch.one/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password }),
});
const data = await response.json();
// Store JWT token in SecureStore
```

2. Add API base URL to environment:
```bash
# .env
EXPO_PUBLIC_API_URL=https://api.amoramatch.one
```

3. Recommended backend stack:
   - **Node.js**: Express + Socket.io + WebRTC
   - **Streaming**: AWS IVS, Mux, or Agora.io
   - **Database**: PostgreSQL + Redis
   - **Auth**: Firebase Auth or custom JWT

## Live Streaming Architecture

For production live streaming, integrate:

| Service | Purpose |
|---------|---------|
| **Agora.io** | Real-time video SDK |
| **AWS IVS** | Managed live streaming |
| **Mux** | Video streaming API |
| **100ms** | Live video infrastructure |

Example Agora integration:
```bash
npm install react-native-agora
```

## Monetization

The app includes virtual currency infrastructure:

- **In-app purchases**: Integrate RevenueCat or Stripe
- **Gifting system**: Send virtual gifts during streams
- **VIP subscriptions**: Monthly tiers with perks
- **Ad integration**: Google AdMob or AppLovin

## License

MIT License - feel free to use for commercial projects.

## Support

For issues or feature requests, please open a GitHub issue or contact support.
