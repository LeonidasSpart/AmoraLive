# Amora - Premium Dating Platform

[![Frontend CI](https://github.com/amora/amora-platform/actions/workflows/frontend.yml/badge.svg)](https://github.com/amora/amora-platform/actions/workflows/frontend.yml)
[![Backend CI](https://github.com/amora/amora-platform/actions/workflows/backend.yml/badge.svg)](https://github.com/amora/amora-platform/actions/workflows/backend.yml)
[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)

> Amora is a premium dating platform delivering a more professional, luxurious, and advanced experience than traditional dating apps. Built with Next.js, NestJS, PostgreSQL, and AI-powered matching.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Railway       │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend API) │     │   (Database)    │
│   Next.js 14    │◄────│   NestJS 10     │◄────│   Prisma ORM    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌─────────────────┐
                        │   Redis         │
                        │   (Cache/Queue) │
                        └─────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone Repository

```bash
git clone https://github.com/amora/amora-platform.git
cd amora-platform
```

### 2. Start Infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis locally.

### 3. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend runs at `http://localhost:3000`
API docs at `http://localhost:3000/api/docs`

### 4. Setup Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3001`

## Project Structure

```
amora-platform/
├── frontend/          # Next.js 14 + TypeScript + Tailwind
│   ├── src/app/       # App Router pages
│   ├── src/components/# Reusable components
│   └── public/        # Static assets
├── backend/           # NestJS + Prisma + PostgreSQL
│   ├── src/auth/      # Authentication module
│   ├── src/matching/  # AI matching engine
│   ├── src/messaging/ # WebSocket real-time chat
│   ├── src/payments/  # Payment processing
│   ├── src/admin/     # Admin dashboard API
│   └── prisma/        # Database schema
└── docker/            # Docker configurations
```

## Features

- **AI-Powered Matching** — Personality, interest, lifestyle, and values compatibility
- **Real-Time Messaging** — WebSocket chat with typing indicators, read receipts, reactions
- **Premium Subscriptions** — Apple IAP, Google Play, PayPal, Cryptocurrency
- **Verified Profiles** — Photo, identity, and background verification
- **Admin Dashboard** — User management, moderation, analytics
- **Security** — JWT auth, 2FA, rate limiting, GDPR-ready

## Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway)
```bash
cd backend
railway login
railway up
```

## Environment Variables

See `.env.example` files in both `frontend/` and `backend/` directories.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

---

Built with love by the Amora Team.
