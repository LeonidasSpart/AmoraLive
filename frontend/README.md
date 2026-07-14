# Amora Frontend

Next.js 14 frontend for the Amora Premium Dating Platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start development server
npm run dev
```

## Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # Landing page
│   ├── layout.tsx    # Root layout
│   ├── auth/         # Authentication pages
│   ├── discover/     # Swipe/matching interface
│   ├── messages/     # Real-time chat
│   ├── profile/      # User profile
│   ├── premium/      # Subscription plans
│   └── admin/        # Admin dashboard
├── components/       # Reusable components
│   ├── ui/           # UI primitives
│   ├── layout/       # Layout components
│   ├── discover/     # Discovery components
│   ├── messages/     # Messaging components
│   └── profile/      # Profile components
├── hooks/            # Custom React hooks
├── lib/              # Utilities & API clients
├── store/            # Zustand state stores
└── types/            # TypeScript types
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, testimonials |
| `/auth/login` | Email/password + social login |
| `/auth/register` | Multi-step registration wizard |
| `/discover` | Tinder-style swipe interface |
| `/messages` | Real-time chat with conversations |
| `/profile` | Profile editing & photo management |
| `/premium` | Subscription plans & payments |
| `/admin` | Admin dashboard (admin only) |

## Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript compiler
npm run test           # Run Jest tests
```

## Deployment

### Vercel
```bash
vercel --prod
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | Yes |

## Design System

### Colors
- Primary: `#ec4899` (Amora Pink)
- Gold: `#fbbf24` (Premium accent)
- Background: `#020617` (Midnight)
- Surface: `#0f172a` (Dark card)

### Typography
- Body: Inter
- Display: Playfair Display

### Components
- `amora-button` — Primary CTA button
- `amora-button-outline` — Secondary button
- `gold-button` — Premium action button
- `glass-card` — Translucent card
- `premium-card` — Gradient card
