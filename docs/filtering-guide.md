# DappArchive Filtering and Tagging Guide

This guide explains the new filtering capabilities in DappArchive and how to effectively tag content to improve discoverability.

## Table of Contents

1. [Overview](#overview)
2. [Filtering Capabilities](#filtering-capabilities)
3. [Database Schema](#database-schema)
4. [Tagging Process](#tagging-process)
5. [Deployment Process](#deployment-process)
6. [Troubleshooting](#troubleshooting)

## Overview

DappArchive now includes enhanced filtering and categorization features to help users discover relevant dapps and UI designs more efficiently. These features include:

- Filtering dapps by type and category
- Filtering images by flow type and UI element
- Enhanced navigation with desktop sidebar and mobile drawer
- Active filters display for easily tracking and removing filters

## Filtering Capabilities

### Dapp Filtering

Dapps can be filtered by:

- **Type**: The general purpose of the dapp
  - DEFI: Decentralized finance applications
  - NFT: Non-fungible token platforms
  - SOCIAL: Social networks and communication platforms
  - GAMING: Games and gaming platforms
  - TOOLS: Utility tools and services
  - OTHER: Miscellaneous dapps

- **Category**: The specific function of the dapp
  - LENDING: Lending and borrowing platforms
  - EXCHANGE: Trading and exchange platforms
  - MARKETPLACE: Buying and selling platforms
  - WALLET: Crypto wallets and key management
  - ANALYTICS: Data and analytics dashboards
  - GOVERNANCE: DAO and voting systems
  - LAUNCHPAD: Token launch platforms
  - BRIDGE: Cross-chain bridges and transfers
  - OTHER: Miscellaneous functions

### Image Filtering

Images can be filtered by:

- **Flow Type**: The user journey or process being shown
  - ONBOARDING: User registration and onboarding processes
  - TRADING: Trading and exchange flows
  - MINTING: NFT and token creation processes
  - PROFILE: User profile and account management
  - SETTINGS: Configuration and settings pages
  - SWAP: Token swap interfaces
  - SEND: Transaction sending flows
  - RECEIVE: Asset receiving and deposit flows
  - OTHER: Miscellaneous flows

- **UI Element**: The primary UI component in the image
  - TABLE: Data tables and lists
  - DIALOG: Dialog boxes and confirmations
  - CARD: Card-based layouts
  - FORM: Input forms and data entry
  - CHART: Data visualizations and charts
  - MODAL: Modal windows and overlays
  - NAVIGATION: Navigation elements and menus
  - BUTTON: Buttons and call-to-actions
  - INPUT: Input fields and controls
  - OTHER: Miscellaneous UI elements

## Database Schema

The database schema has been updated to include the following new fields:

### Dapp Model

```prisma
model Dapp {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  logoUrl     String?
  website     String?
  category    DappCategory?  // New field
  type        DappType?      // New field
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  images Image[]
  flows  Flow[]

  @@map("dapps")
}
```

### Image Model

```prisma
model Image {
  id          String   @id @default(cuid())
  url         String
  title       String?
  description String?
  category    DappCategory?  // New field
  version     String?
  capturedAt  DateTime?
  isPremium   Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  flow        ImageFlow?  // New field
  uiElement   UIElement?  // New field
  tags        String[]    // New field

  dappId String
  dapp   Dapp   @relation(fields: [dappId], references: [id], onDelete: Cascade)
  flowSteps FlowStep[]

  @@index([dappId])
  @@map("images")
}
```

## Tagging Process

### Using the Tagging Tool

We've created a tagging tool to help efficiently categorize existing content. To use this tool:

1. Run the tagging script:
   ```bash
   npx ts-node scripts/tag-existing-data.ts
   ```

2. Follow the prompts to tag dapps and/or images:
   - The tool will suggest appropriate tags based on content analysis
   - You can accept the suggestions or enter custom values
   - You can skip items you're not ready to tag

### Tagging Guidelines

When tagging content, follow these guidelines for consistency:

1. **Dapp Type**: Choose the primary purpose of the dapp
   - If a dapp serves multiple purposes, choose the most prominent one
   - Only use OTHER when none of the standard types apply

2. **Dapp Category**: Choose the specific function of the dapp
   - Be as specific as possible while staying within the defined categories
   - Only use OTHER when none of the standard categories apply

3. **Image Flow**: Tag based on the user journey shown in the image
   - Consider the overall process rather than just what's visible
   - Use context from surrounding images when available

4. **UI Element**: Tag based on the most prominent UI component
   - Choose the element that occupies the most space or has the most importance
   - Consider the functional purpose of the screen

## Deployment Process

To deploy the schema changes to production:

1. Run the deployment script:
   ```bash
   npx ts-node scripts/deploy-schema.ts
   ```

2. The script will:
   - Test the database connection
   - Push the schema changes
   - Verify the changes were applied correctly
   - Generate an updated Prisma client

3. Ensure your application is using the updated Prisma client:
   ```bash
   npx prisma generate
   ```

## Troubleshooting

### Schema Migration Issues

If you encounter issues with the schema migration:

1. **Missing Columns**: If the application shows errors about missing columns:
   - Ensure you've run `npx prisma db push` successfully
   - Check that the environment has the correct database credentials
   - Verify the Prisma client has been regenerated

2. **Type Errors**: If you see type errors in the codebase:
   - Regenerate the Prisma client with `npx prisma generate`
   - Update any type imports in the codebase

3. **Runtime Errors**: If the application fails to query the new fields:
   - Use the defensive coding pattern in `src/app/page.tsx` and `src/app/[slug]/page.tsx`
   - Ensure UI components handle null/undefined values gracefully

### Tagging Tool Issues

If you encounter issues with the tagging tool:

1. **Connection Errors**: If the tool fails to connect to the database:
   - Verify your `.env` file has the correct DATABASE_URL
   - Check network permissions and firewall settings

2. **Type Errors**: If the tool rejects valid enum values:
   - Ensure you're using uppercase values exactly as defined in the schema
   - Check for any typos or spaces in the input

3. **Script Failures**: If the script crashes unexpectedly:
   - Check the console output for error details
   - Verify you have the necessary permissions to update records 