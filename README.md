# Dapp Design Archive

A curated repository of Web3 dapp UI/UX designs - the "Mobbin for Web3".

## Features

- 🎨 Curated collection of Web3 dapp designs
- 🔄 User flows and complete journeys
- 💎 Freemium model (3 free views, $5 lifetime upgrade)
- 📱 Responsive design with image galleries
- 🔐 User authentication with Clerk
- 💳 Stripe integration for payments
- 📊 Admin panel for content management

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk
- **Payments**: Stripe
- **Storage**: Cloudinary (configurable)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dapp-ui-archive
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables:
- Database URL
- Clerk keys
- Stripe keys
- Cloudinary credentials (optional)

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
/dapp-ui-archive
├── /public                  # Static assets
├── /src
│   ├── /app                 # Next.js app directory
│   │   ├── layout.tsx       # Base layout
│   │   ├── page.tsx         # Landing page
│   │   ├── /[slug]          # Individual dapp pages
│   │   └── /api             # API routes
│   ├── /components          # Reusable UI components
│   ├── /lib                 # Utilities (auth, stripe, db)
│   ├── /server              # Server-side actions
│   └── /types               # TypeScript types
├── /prisma                  # Database schema
└── /scripts                 # Utility scripts
```

## Key Components

### Authentication & Access Control
- Clerk handles user authentication
- Freemium model: 3 free image views, then $5 lifetime upgrade
- Premium content is gated behind paywall

### Database Schema
- **Users**: Clerk integration with premium status
- **Dapps**: Web3 applications with metadata
- **Images**: Screenshots with categories and premium flags
- **Flows**: Multi-step user journeys
- **FlowSteps**: Individual steps in flows

### Payment Flow
1. User hits premium content limit
2. Paywall modal appears
3. Stripe checkout for $5 lifetime access
4. Webhook updates user to premium status

## Content Management

### Adding New Dapps

Use the upload script to bulk add images:

```bash
npm run upload-images <dapp-name>
```

Configure dapps in `scripts/upload_images.ts`:

```typescript
const configs: ImageUploadConfig[] = [
  {
    dappName: 'Uniswap',
    description: 'Leading decentralized exchange',
    category: 'DeFi',
    imagesPath: './images/uniswap',
    imageCategories: {
      'swap-1.png': 'Trading',
      'pools-1.png': 'Liquidity',
    },
    isPremium: true,
  }
]
```

### Manual Database Operations

```bash
# Open Prisma Studio
npm run db:studio

# Push schema changes
npm run db:push
```

## Deployment

### Database Setup
1. Create PostgreSQL database (Railway, Supabase, etc.)
2. Update `DATABASE_URL` in production

### Environment Variables
Ensure all production environment variables are set:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Stripe Webhooks
1. Create webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
2. Select events: `checkout.session.completed`
3. Copy webhook secret to environment variables

## Development Workflow

### Adding New Features
1. Update database schema in `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Update TypeScript types in `src/types/`
4. Implement UI components
5. Add API routes if needed

### Content Updates
1. Add images to appropriate folder
2. Update upload script configuration
3. Run upload script
4. Verify in Prisma Studio

## AI Maintenance Log

**Every developer must document changes here:**

- 2025-05-30 (System): Created initial project structure and architecture
- 2025-05-30 (System): Implemented core components: auth, paywall, image grid
- 2025-05-30 (System): Added Stripe integration and webhook handling
- 2025-05-30 (System): Created upload script for bulk image management

---

## Contributing

1. Document all changes in this README
2. Follow the established patterns for components and API routes
3. Test freemium flow before deploying
4. Ensure responsive design works on mobile

## License

Private - All rights reserved