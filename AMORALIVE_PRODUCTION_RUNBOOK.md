# AmoraLive Production Runbook

## Current architecture
- Web: Vercel -> https://www.amoramatch.one
- API: Railway -> https://api.amoramatch.one
- Database: Railway PostgreSQL
- Realtime: Socket.IO + native WebSocket bridge at `/ws`
- Payments: Stripe web checkout + webhook
- Native purchases: Apple/Google must be verified server-side before crediting coins
- Media: S3-compatible storage
- Live video: LiveKit token endpoint + LiveKit web client

## Railway variables required
Copy `backend/.env.example` into Railway Variables and replace every placeholder.

Minimum required for core API:
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- APP_URL
- CORS_ORIGIN

Required for real monetization:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Required for Apple App Store in-app purchases:
- APPLE_SHARED_SECRET (only needed if any CoinPackage has apple_product_id set)

Required for Google Play in-app purchases:
- GOOGLE_SERVICE_ACCOUNT_JSON (only needed if any CoinPackage has google_product_id set)
- GOOGLE_PLAY_PACKAGE_NAME

Required for Google login:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_REDIRECT_URI=https://api.amoramatch.one/auth/google/callback

Required for email verification:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- EMAIL_FROM

Required for profile/media uploads:
- S3_BUCKET
- S3_REGION
- S3_ACCESS_KEY_ID
- S3_SECRET_ACCESS_KEY
- S3_PUBLIC_BASE_URL
- optional S3_ENDPOINT / S3_FORCE_PATH_STYLE for R2/Spaces/etc.

Required for real Live video:
- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET

## Railway build/start
The backend package now runs `prisma generate` during `postinstall` and explicitly targets `debian-openssl-3.0.x`.
Start command: `npm start`

If the database schema is already present, deploy the backend first and verify `/health`.

## Stripe webhook
Configure the Stripe webhook endpoint:
`https://api.amoramatch.one/payments/stripe/webhook`

Subscribe at minimum to:
- checkout.session.completed
- checkout.session.async_payment_succeeded
- customer.subscription.updated
- customer.subscription.deleted

## Live video
The API exposes:
`GET /live/:id/token`

The web client loads LiveKit from the browser CDN and connects to the LiveKit room using the short-lived token issued by the API. Hosts receive publish permission; viewers receive subscribe-only permission.

## Native in-app purchases (Apple/Google)
The API exposes:
`POST /wallet/iap/apple/verify` — body `{ packageId, receiptData }`
`POST /wallet/iap/google/verify` — body `{ packageId, purchaseToken }`

Both verify the purchase directly against Apple's/Google's servers before crediting any coins — the client-submitted receipt/token is never trusted on its own. Each purchase is credited exactly once: the platform-issued transaction ID (Apple `transaction_id`, Google `purchaseToken`) is stored as a unique `Purchase.purchase_token`, so a resubmitted or replayed receipt is a no-op rather than a double-credit.

Coin packages need `apple_product_id` / `google_product_id` set (via `/admin/packages`) to match the product IDs configured in App Store Connect / Play Console before native purchases will work for that package.

The mobile app falls back to the same Stripe web checkout used on the web whenever native purchases aren't available (e.g. running in Expo Go instead of a dev/production build).

## Important security rules
- Never put Stripe secret keys, Google client secrets, SMTP passwords, S3 secrets, LiveKit API secrets, the Apple shared secret, or the Google service account key in the frontend.
- Never credit coins from a browser success page. Coins are credited only by the verified Stripe webhook or the verified Apple/Google purchase-verification endpoints above.
- Never trust a client-supplied user ID for realtime authentication.
- Keep `JWT_SECRET` long and random.
- Keep the production database private.
