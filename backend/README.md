# Amora Backend API

NestJS-based backend API for the Amora Premium Dating Platform.

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis 7
- **Queue**: Bull (Redis-based)
- **Auth**: JWT + Passport + OAuth2
- **Real-Time**: Socket.IO WebSockets
- **API Docs**: Swagger/OpenAPI

## Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## API Endpoints

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/v1/auth` | Registration, login, OAuth, 2FA |
| Users | `/api/v1/users` | Profile management |
| Matching | `/api/v1/matching` | AI recommendations, likes, matches |
| Messaging | `/api/v1/messaging` | Conversations, messages |
| Payments | `/api/v1/payments` | Apple/Google/PayPal/Crypto |
| Admin | `/api/v1/admin` | Dashboard, user management |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `conversation:join` | Client → Server | Join a conversation room |
| `message:send` | Client → Server | Send a message |
| `message:new` | Server → Client | New message received |
| `typing` | Bidirectional | Typing indicators |
| `message:read` | Client → Server | Mark as read |

## Scripts

```bash
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
npm run lint           # Run ESLint
```

## Docker

```bash
# Build image
docker build -t amora-backend -f docker/Dockerfile .

# Run with compose
docker-compose up -d
```

## Deployment

### Railway
```bash
railway login
railway link
railway up
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_HOST` | Redis hostname | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `EMAIL_HOST` | SMTP server host | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `APPLE_CLIENT_ID` | Apple Sign-In client ID | No |
| `PAYPAL_CLIENT_ID` | PayPal API client ID | No |
| `SENTRY_DSN` | Sentry error tracking DSN | No |
