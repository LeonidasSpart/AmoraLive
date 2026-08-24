# AmoraLive Mobile

Expo / React Native client for iPhone, iPad and Android.

Production API: `https://api.amoramatch.one`

## Current release work

- Premium Amora visual system: deeper glass surfaces, luxury gradients, 3D gift presentation and animated live-gift moments.
- Bundled gift artwork so the native live picker never depends on an empty `image_url`.
- Production app icon + splash artwork.
- iOS / Android version and build-number fields are present in `app.json`.
- Account deletion is available from the native profile screen.
- Native coin purchases remain server-verified. Web/Stripe checkout is only a development fallback; production iOS/Android builds require the corresponding App Store / Google Play product IDs.

## Store release requirements

1. Configure the Apple and Google product IDs for every coin package in the backend/admin catalog.
2. Complete the native Apple purchase flow and Google Play purchase flow in real production builds and verify the server receipt/token endpoints.
3. Add Sign in with Apple before iOS submission because the mobile app currently offers Google as a third-party login option.
4. Run dependency/version validation with Expo before the first production build and keep the SDK, React Native and Expo modules on a compatible set.
5. Build and test on physical iPhone/iPad and Android devices, including camera, microphone, LiveKit, profile photo upload, gifts, chat, matching and account deletion.
6. Prepare App Store Connect / Play Console metadata, privacy disclosures, age rating, data-safety declarations, screenshots and reviewer demo credentials.
7. Keep the backend live and reviewable during store review.

The legacy `frontend/expo/` directory is retained for compatibility/history; `frontend/mobile/` is the current Expo Router application and the intended store build target.
