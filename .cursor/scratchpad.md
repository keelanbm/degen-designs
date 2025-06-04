# Background and Motivation

The current DappArchive UI and database structure allow for basic browsing of dapps and their images, but do not provide robust categorization, tagging, or navigation features. As the archive grows, users will need better ways to discover, filter, and browse dapps and their associated flows/screens. This is especially important for supporting a broad array of dapp types (e.g., DeFi, NFT, Social, Gaming, etc.) and for enabling users to view specific flows (e.g., onboarding, trading, minting) and UI elements (e.g., tables, dialogs).

# Key Challenges and Analysis
- Current image categorization is limited and not standardized across dapps.
- Navigation is basic and does not support filtering by category, flow, or app type.
- No tagging system for images or dapps (e.g., to mark a screen as "onboarding" or "swap").
- Database schema may need to be updated to support richer metadata (categories, tags, flows, types).
- UI needs to support new navigation and filtering paradigms (e.g., sidebar, chips, dropdowns, search).
- Need to define a set of relevant categories and flows for dapps (DeFi, NFT, Social, Gaming, etc.).

# High-level Task Breakdown

## 1. Database & Backend
- [x] Design and implement a new schema for image and dapp categorization:
  - [x] Add `category` and `type` fields to dapps (e.g., DeFi, NFT, Social, Gaming, Tools, etc.)
  - [x] Add `flow` and `tags` fields to images (e.g., Onboarding, Trading, Minting, etc.; tags as array)
  - [x] Add a `uiElement` field to images (e.g., Table, Dialog, Card, etc.)
- [x] Update API routes for dapps and images to support new fields
- [x] Implement admin interfaces for managing dapps and images with the new fields

## 2. UI/UX
- [x] Design new navigation components for filtering/browsing:
  - [x] Sidebar or topbar with categories, flows, and UI elements
  - [x] Chips or dropdowns for multi-select filtering
  - [x] Search bar for keywords/tags
- [x] Update dapp and image pages to display new metadata (category, flow, tags, UI element)
- [x] Add filter and sort controls to main browsing pages
- [x] Ensure mobile responsiveness and accessibility

## 3. Tagging & Categorization
- [x] Define a standard set of categories, flows, and UI elements relevant to dapps
- [x] Create tools for tagging existing dapps and images with new metadata
- [x] Document tagging guidelines for future uploads

## 4. Deployment & Maintenance
- [x] Create a script for deploying schema changes to production
- [x] Make code resilient to handle schema differences during deployment
- [x] Add documentation for the new filtering and tagging features

# Project Status Board
- [x] Database schema designed and implemented
- [x] Admin interface for dapp management implemented
- [x] Admin interface for image uploads with metadata implemented
- [x] Admin interface for user management implemented
- [x] Image deletion functionality implemented
- [x] Dapp deletion functionality implemented
- [x] UI components for filtering dapps by category and type implemented
- [x] UI components for filtering images by flow and UI element implemented
- [x] Navigation/filtering components implemented
- [x] Image display with metadata implemented
- [x] Tools for tagging existing content created
- [x] Deployment scripts for schema changes created
- [x] Documentation for new features created
- [ ] Existing data tagged and verified

# Executor's Feedback or Assistance Requests
- We've successfully implemented the admin interfaces for managing dapps, images, and users with proper categorization.
- We've also implemented user-facing UI components for filtering and browsing dapps and images by their new metadata.
- We've updated the Prisma schema to include the new fields and pushed the changes to the database.
- We've modified the pages to handle cases where older records might not have the new fields.
- We ran into an issue where the database schema didn't have the new columns yet, causing errors when the app tried to query them.
- As a temporary fix, we've modified the code to handle missing columns gracefully by:
  - Simplifying queries to not reference the new columns in the where clause
  - Adding null values for the missing fields after fetching the data
  - Making the UI components handle null/undefined values
- We've created tools to assist with tagging existing content:
  - A tagging script that suggests appropriate tags based on content analysis
  - A deployment script to push schema changes to production safely
- We've added comprehensive documentation to explain the new filtering capabilities and tagging process.
- The next steps should focus on running the tagging tool to categorize existing content and deploying the schema changes to production.

# Lessons
- When updating schemas, always write migration scripts and backfill data for a smooth transition.
- Plan UI/UX changes with wireframes before implementation.
- Standardize categories and tags early to avoid fragmentation.
- Initialize storage buckets before trying to use them to avoid "Bucket not found" errors.
- Always include proper type checking for enum fields in database schemas and API routes.
- When implementing filters, make sure to handle the case when no items match the filters.
- When updating database schemas, always push the changes to the actual database using `npx prisma db push` to avoid runtime errors.
- Always make UI components handle missing or null values gracefully to support both new and existing data.
- When adding new columns to a database schema, make your application code resilient to handle cases where the columns don't exist yet during deployment transitions.
- Create tools to assist with data migration and tagging to make the process more efficient and less error-prone.
- Provide comprehensive documentation for new features to ensure proper usage and maintenance. 