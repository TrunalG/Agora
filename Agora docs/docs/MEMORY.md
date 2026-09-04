# Project Memory

## Current Architecture
- **Framework**: Next.js 16.3.0 (App Router), React 19, TypeScript 5.7.3, Tailwind CSS v4.
- **Database / Backend**: Full-stack Next.js API Routes connected to MongoDB via Mongoose (`lib/db/mongodb.ts`) with 7 core models (`User`, `ConnectionRequest`, `Conversation`, `Message`, `Notification`, `Block`, `Report`).
- **Authentication**: JWT authentication with HTTP-only cookies (`lib/auth.ts`) and password hashing using `bcryptjs`.
- **Real-Time Messaging**: Socket.IO integrated with persistent MongoDB message storage and paginated history.

## Important Files
- [app/page.tsx](file:///c:/Users/truna/Downloads/skill-exchange-network/app/page.tsx): Main entry point rendering `SkillfulApp`.
- [app/layout.tsx](file:///c:/Users/truna/Downloads/skill-exchange-network/app/layout.tsx): Root layout with metadata and styling setup.
- [components/skillful-app.tsx](file:///c:/Users/truna/Downloads/skill-exchange-network/components/skillful-app.tsx): Core interactive full-stack component wired to real Next.js API routes while preserving the V0 visual UI.
- [lib/prototype-utils.ts](file:///c:/Users/truna/Downloads/skill-exchange-network/lib/prototype-utils.ts): Shared business logic (`calculateMatch`, `getProfileCompletion`, `searchUsers`).
- [lib/db/mongodb.ts](file:///c:/Users/truna/Downloads/skill-exchange-network/lib/db/mongodb.ts): Connection caching layer for MongoDB/Mongoose.
- [lib/auth.ts](file:///c:/Users/truna/Downloads/skill-exchange-network/lib/auth.ts): JWT token signing, verification, and HTTP-only cookie management.
- [docs/SETUP_AND_ACTION_ITEMS.md](file:///c:/Users/truna/Downloads/skill-exchange-network/docs/SETUP_AND_ACTION_ITEMS.md): User setup guide & testing checklist.
- [docs/PROJECT_STRUCTURE.md](file:///c:/Users/truna/Downloads/skill-exchange-network/docs/PROJECT_STRUCTURE.md): Full codebase directory map & file walkthrough.
- [.env](file:///c:/Users/truna/Downloads/skill-exchange-network/.env): Single environment configuration file.

## Implemented Features
- **JWT Auth & Session Management**: Full registration (`/api/auth/register`), login (`/api/auth/login`), logout (`/api/auth/logout`), and current user session validation (`/api/auth/me`).
- **Onboarding & Profile Persistence**: Skills to learn/teach onboarding (`/api/user/onboarding`), profile edits (`/api/user/profile`) including up to 5 validated profile links.
- **Explore & Search API**: Server-backed user search (`/api/users`) supporting name/skill queries, country filtering, and pagination.
- **Connection Requests**: Persistent request creation, accepting, rejecting (`/api/connections/request` and `/api/connections`).
- **1-to-1 Messaging**: Persistent conversations & paginated chat messages (`/api/conversations` and `/api/messages`).
- **Notifications**: Persistent in-app notifications and unread badge count (`/api/notifications`).
- **Account Settings & Privacy**: Appearance preferences, notification toggling (`/api/user/settings`), blocking/unblocking (`/api/user/block`), reporting (`/api/user/report`), and account deletion (`/api/user/account`).

## Known Bugs
- None.

## Fixed Bugs
- Resolved local state reset issue on page reload by connecting all features to persistent MongoDB models.
- Added optional profile links (up to 5 links with URL validation) to user schema and Profile view.

## Recent Code Changes
- 2026-08-23: Created single `.env` file and updated `.gitignore` to protect `.env`.
- 2026-08-23: Installed Mongoose, bcryptjs, jsonwebtoken, socket.io, socket.io-client.
- 2026-08-23: Implemented Mongoose connection caching in `lib/db/mongodb.ts` and 7 database models.
- 2026-08-23: Implemented 15 full-stack API route handlers under `app/api/`.
- 2026-08-23: Connected `components/skillful-app.tsx` to backend APIs while strictly preserving existing visual UI.
- 2026-08-23: Verified zero TypeScript errors (`npx tsc --noEmit`) and successful Next.js build compilation (`npm run build`).

## Important Technical Decisions
- Use single `.env` file for all environment variables (no `.env.local` or extra env files).
- Keep Next.js App Router structure with server route handlers for API security.
- Store JWT tokens exclusively in HTTP-only cookies to prevent XSS credential leaks.

## Constraints / Rules
- Strictly follow single `.env` file policy.
- Update `docs/FUNCTIONS_STATUS.md` and `docs/MEMORY.md` on every feature change/fix.
- Never alter the visual UI design during functional implementation phases.

