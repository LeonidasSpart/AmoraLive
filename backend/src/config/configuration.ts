export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'Amora <noreply@amora.app>',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackUrl: process.env.APPLE_CALLBACK_URL,
    iapSharedSecret: process.env.APPLE_IAP_SHARED_SECRET,
  },

  googlePlay: {
    // JSON string of the Play Console service-account key, used for server-side
    // Google Play Developer API purchase verification (distinct from OAuth login above).
    serviceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON,
  },

  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
  },

  crypto: {
    enabled: process.env.CRYPTO_ENABLED === 'true',
    infuraKey: process.env.INFURA_KEY,
    ethNetwork: process.env.ETH_NETWORK || 'mainnet',
    btcNetwork: process.env.BTC_NETWORK || 'mainnet',
    merchantWallet: process.env.CRYPTO_MERCHANT_WALLET,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  },

  app: {
    name: 'Amora',
    url: process.env.APP_URL || 'https://amora.app',
    apiUrl: process.env.API_URL || 'https://api.amora.app',
  },
});
