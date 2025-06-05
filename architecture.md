# Architecture Overview for Dapp Design Repository

## Summary
This document outlines the architecture of the Dapp Design Repository app ("Mobbin for Web3"). It includes the main components, their purposes, and structure, with an AI rule to document every change in the codebase.

## Goals
- View curated UI/UX flows of dapps (by app, page, or flow)
- Freemium access (3 free images, then pay $5 lifetime)
- User accounts with ability to save and download images
- Admin panel for adding/editing flows
- Easily maintainable and extendable codebase

---

## Tech Stack
- **Frontend:** Next.js (React), TailwindCSS, shadcn/ui
- **Backend:** Node.js (Express or integrated with Next.js API routes)
- **Database:** PostgreSQL (hosted on Supabase or Railway)
- **Storage:** Cloudinary or S3-compatible image storage
- **Auth:** Clerk/Auth0 or Supabase Auth
- **Payments:** Stripe (one-time checkout)

---

## Project Structure

```
/dapp-ui-archive
│
├── /public                  # Static assets
├── /src
│   ├── /app                 # Next.js app directory
│   │   ├── layout.tsx       # Base layout
│   │   ├── page.tsx         # Landing page
│   │   └── /[slug]          # Individual dapp pages
│   │       └── page.tsx     # Render UI gallery per dapp
│   ├── /components          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── ImageGrid.tsx
│   │   ├── Paywall.tsx
│   │   └── FlowSelector.tsx
│   ├── /lib                 # Utilities
│   │   ├── auth.ts          # Auth logic
│   │   ├── stripe.ts        # Stripe integration
│   │   └── db.ts            # DB connection/client
│   ├── /hooks               # Custom React hooks
│   ├── /styles              # Global CSS or Tailwind config
│   ├── /types               # TypeScript types
│   ├── /server              # Server-side actions (image uploads, auth, etc)
│   │   └── image.ts         # CRUD for images
│   └── /middleware.ts       # Auth middleware, rate limiting, etc
│
├── /prisma                 # DB schema and migrations
│   ├── schema.prisma        # Models: User, Image, Dapp, Flow
│
├── /scripts                # Maintenance or import scripts
│   └── upload_images.ts     # Script to bulk upload local images
│
├── .env                    # Environment variables
├── package.json            # Project metadata and scripts
├── next.config.js          # Next.js config
└── README.md               # Project documentation
```

---

## Main File Responsibilities

### `/src/app/page.tsx`
- Homepage with featured apps and call to action

### `/src/app/[slug]/page.tsx`
- Dynamic route to show individual dapp UI galleries
- Includes tabs/sections for pages (onboarding, trading, settings, etc)

### `/src/components/*`
- Modular, reusable components like grids, modals, navigation, etc.

### `/src/lib/auth.ts`
- Manages login/logout, checks auth status, and user sessions

### `/src/lib/stripe.ts`
- Stripe SDK setup and checkout session creation

### `/src/server/image.ts`
- Handles image upload and retrieval
- Protects premium content behind auth/paywall

### `/prisma/schema.prisma`
- Database models:
  - `User`: id, email, stripeCustomerId, etc
  - `Dapp`: name, slug, description
  - `Image`: url, dappId, category (login, settings, etc)
  - `Flow`: name, dappId, steps (array of image ids)

### `/scripts/upload_images.ts`
- CLI script to upload image folders into your DB and storage

---

## Features to Maintain
- Admin panel to upload new apps/images (auth restricted)
- AI auto-tagging of new images (optional enhancement)
- Freemium enforcement middleware
- Stripe webhook to verify payment and upgrade users

---

## AI Maintenance Rule
**Every developer must document any code, architectural, or schema change here or in the relevant README sections.**
- Add a bullet point summary of the change
- Include date and your initials

---

## Example AI Rule Log
- 2025-05-19 (KM): Created base project structure and architecture file.
- 2025-05-20 (KM): Added Stripe integration and freemium logic.
