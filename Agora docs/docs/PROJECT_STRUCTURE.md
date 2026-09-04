# Project Architecture & Directory Structure

This document provides a complete guide to the folder structure, architectural organization, and responsibilities of every file in the **Skill Exchange Network** full-stack repository.

---

## 🏗️ High-Level Tech Stack

- **Framework**: Next.js 16.3.0 (App Router)
- **Language**: TypeScript 5.7.3
- **Styling**: Tailwind CSS v4, Vanilla CSS variables, Lucide React icons
- **Database**: MongoDB with Mongoose (cached connection layer)
- **Authentication**: JWT signed tokens stored in HTTP-Only cookies (`auth_token`), password hashing via `bcryptjs`
- **Real-Time Communication**: Socket.IO / WebSockets layer

---

## 📁 Directory & File Architecture Map

```text
skill-exchange-network/
├── app/                        # Next.js App Router Root
│   ├── api/                    # Server-side API Route Handlers
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── login/route.ts  # POST: Login & JWT cookie issue
│   │   │   ├── logout/route.ts # POST: Logout & JWT cookie clear
│   │   │   ├── me/route.ts     # GET: Validate session & fetch user
│   │   │   └── register/route.ts# POST: 2-step OTP generation & password hash user creation
│   │   ├── connections/        # Connection Request endpoints
│   │   │   ├── request/route.ts# POST: Send request | PUT: Accept/reject | DELETE: Withdraw sent request
│   │   │   └── route.ts        # GET: User connections & pending requests
│   │   ├── conversations/      # Chat Conversation endpoints
│   │   │   └── route.ts        # GET: Fetch conversations | POST: Create 1-to-1 chat
│   │   ├── messages/           # Chat Message endpoints
│   │   │   └── route.ts        # GET: History | POST: Send | PATCH: Mark read
│   │   ├── notifications/      # Notification endpoints
│   │   │   └── route.ts        # GET: User notifications | PATCH: Mark read
│   │   ├── user/               # User Settings & Profile endpoints
│   │   │   ├── account/route.ts# DELETE: Secure account deletion
│   │   │   ├── block/route.ts  # GET, POST, DELETE: User blocking management
│   │   │   ├── onboarding/route.ts# POST: Save initial skillsToLearn & teach
│   │   │   ├── profile/route.ts# GET: Fetch profile | PUT: Edit bio, links, etc.
│   │   │   ├── report/route.ts # POST: Report inappropriate user
│   │   │   └── settings/route.ts# PUT: Persist theme & notification preferences
│   │   └── users/              # Explore & Search endpoint
│   │       └── route.ts        # GET: Paginated search by name, skill, country (excludes connected members)
│   ├── globals.css             # Tailwind CSS v4 theme variables & global styles
│   ├── layout.tsx              # Root HTML & body layout shell
│   └── page.tsx                # Entry page rendering <SkillfulApp />
├── components/                 # Modular Frontend React Presentation Layer
│   ├── ui/                     # Base UI primitive components (shadcn/radix)
│   ├── AuthModal.tsx           # Login, 2-step OTP registration & password policy validator modal
│   ├── Avatar.tsx              # Profile avatar with fallback initials styling
│   ├── Chip.tsx                # Skill badge tag component with removal callback
│   ├── Modal.tsx               # Accessible backdrop dialog overlay
│   ├── ProfileView.tsx         # Profile display, gallery upload, location, & setup checklist guide
│   ├── SettingsView.tsx        # Dark/light theme toggle, notifications, privacy & danger zone
│   └── skillful-app.tsx        # Main application container & view state coordinator
├── docs/                       # Project Documentation & Memory
│   ├── FUNCTIONS_STATUS.md     # Single source of truth for feature statuses
│   ├── MEMORY.md               # Persistent technical memory & decisions log
│   ├── PROJECT_STRUCTURE.md    # This directory and file architecture map
│   └── SETUP_AND_ACTION_ITEMS.md# User setup instructions & testing checklist
├── lib/                        # Shared Utilities & Backend Infrastructure
│   ├── db/                     # MongoDB Database Layer
│   │   ├── models/             # Mongoose Data Models
│   │   │   ├── Block.ts        # User block pairs model
│   │   │   ├── ConnectionRequest.ts# Status-tracked request model
│   │   │   ├── Conversation.ts # 1-to-1 conversation pair model
│   │   │   ├── Message.ts      # Chat message history model
│   │   │   ├── Notification.ts # In-app notification model
│   │   │   ├── Report.ts       # Moderation report model
│   │   │   └── User.ts         # User account & profile model
│   │   └── mongodb.ts          # Mongoose connection layer with connection caching
│   ├── auth.ts                 # JWT token generation/verification & cookie tools
│   ├── email.ts                # Resend API HTML transactional email delivery utility
│   ├── prototype-utils.ts      # Match calculation, profile setup checklist & completion logic
│   └── utils.ts                # Classname merger helper (cn)
├── .env                        # Single environment variables configuration
├── .gitignore                  # Git tracking exclusion rules
├── components.json             # Shadcn component configuration
├── next.config.mjs             # Next.js framework configuration
├── package.json                # NPM package dependencies & scripts
├── postcss.config.mjs          # PostCSS build configuration
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🔍 Detailed File Explanations

### `app/` (Next.js Routing Layer)

- **`app/layout.tsx`**: Defines the root HTML document structure, global font settings, metadata, and wraps all pages with styling context.
- **`app/page.tsx`**: Entry point for `http://localhost:3000`. Renders the main `SkillfulApp` component.
- **`app/globals.css`**: Tailwind CSS v4 entry point with color palettes (HSL variables), dark mode styling rules, and baseline CSS definitions.
- **`app/api/auth/register/route.ts`**: Handles 2-step OTP registration flow. Validates 12+ character complex password policy (uppercase, lowercase, number, symbol), generates 6-digit OTP code, delivers email via Resend API, hashes password using `bcryptjs`, and creates the MongoDB `User` document.
- **`app/api/auth/login/route.ts`**: Verifies login credentials against MongoDB, compares bcrypt password hash, and sets the `auth_token` HTTP-Only cookie.
- **`app/api/auth/logout/route.ts`**: Clears the `auth_token` cookie and resets user authentication state.
- **`app/api/auth/me/route.ts`**: Reads the `auth_token` cookie to validate active JWT sessions and returns the logged-in user object.
- **`app/api/user/onboarding/route.ts`**: Persists `skillsToLearn` and `skillsToTeach` selected during initial user onboarding into MongoDB.
- **`app/api/user/profile/route.ts`**: Returns public or personal user profile data on `GET`, and updates bio, country, skills, profile picture, and up to 5 validated URLs on `PUT`.
- **`app/api/users/route.ts`**: Searches MongoDB users by name, username, bio, country, or skills. Excludes active connected partners and blocked users.
- **`app/api/connections/request/route.ts`**: `POST` sends a connection request. `PUT` accepts or rejects a request. `DELETE` allows user to withdraw/cancel sent requests.
- **`app/api/connections/route.ts`**: `GET` returns active connections and pending incoming/outgoing connection requests.
- **`app/api/conversations/route.ts`**: `GET` lists user conversations. `POST` creates or retrieves a 1-to-1 conversation pair between connected users.
- **`app/api/messages/route.ts`**: `GET` fetches paginated chat history. `POST` saves messages to MongoDB and notifies recipient. `PATCH` marks conversation messages as read.
- **`app/api/notifications/route.ts`**: `GET` lists recipient notifications (connection requests pinned to top). `PATCH` marks individual or all notifications as read.
- **`app/api/user/settings/route.ts`**: Saves user preferences (`appearancePreference`: light/dark, `notificationPreference`: boolean).
- **`app/api/user/block/route.ts`**: Manages blocked user records (`GET` list, `POST` block, `DELETE` unblock).
- **`app/api/user/report/route.ts`**: Accepts user flag/report submissions with reason.
- **`app/api/user/account/route.ts`**: Handles account deletion and cleans up associated user data.

---

### `components/` (Modular Presentation Layer)

- **`components/skillful-app.tsx`**: Main application container component. Manages active views ('Explore' | 'Messages' | 'Notifications' | 'Profile' | 'Settings'), search query state, active conversation routing, and asynchronous API calls.
- **`components/Avatar.tsx`**: Modular component rendering profile pictures with initials fallback styling.
- **`components/Chip.tsx`**: Modular component rendering skill badge chips with optional removal callbacks.
- **`components/Modal.tsx`**: Accessible modal overlay dialog component.
- **`components/ProfileView.tsx`**: Modular component handling profile editing, local gallery uploads, preset avatars, links, and interactive Profile Setup Guide checklist.
- **`components/SettingsView.tsx`**: Modular component managing dark/light theme toggles, notification preferences, privacy, and account deletion.
- **`components/AuthModal.tsx`**: Modular component handling Login, 2-step Email OTP verification, real-time password policy validation indicators, and onboarding skill selection.
- **`components/ui/`**: Base UI component primitives generated by Shadcn UI.

---

### `lib/` (Core Logic & Infrastructure)

- **`lib/db/mongodb.ts`**: Prevents multiple MongoDB connections in Next.js development hot-reloading by caching the Mongoose connection promise globally.
- **`lib/db/models/User.ts`**: Mongoose schema defining user fields (`email`, `passwordHash`, `username`, `bio`, `country`, `skillsToLearn`, `skillsToTeach`, `links`, `notificationPreference`, `appearancePreference`).
- **`lib/db/models/ConnectionRequest.ts`**: Mongoose schema for relationship requests (`senderId`, `receiverId`, `message`, `status`: pending|accepted|rejected).
- **`lib/db/models/Conversation.ts`**: Mongoose schema for 1-to-1 chat pairs (`participants`).
- **`lib/db/models/Message.ts`**: Mongoose schema for chat messages (`conversationId`, `senderId`, `content`, `readAt`).
- **`lib/db/models/Notification.ts`**: Mongoose schema for in-app events (`recipientId`, `type`, `referenceId`, `read`).
- **`lib/db/models/Block.ts`**: Mongoose schema for user block relationships (`blockerId`, `blockedId`).
- **`lib/db/models/Report.ts`**: Mongoose schema for user moderation reports (`reporterId`, `reportedUserId`, `reason`).
- **`lib/auth.ts`**: Authentication helper providing `hashPassword`, `comparePassword`, `signToken`, `verifyToken`, `getAuthFromRequest`, and HTTP-Only cookie setter/clearer functions.
- **`lib/email.ts`**: Resend API transactional email utility for delivering HTML verification OTP codes.
- **`lib/prototype-utils.ts`**: Contains `calculateMatch` (skill matching algorithm), `getProfileCompletion` (percentage calculation), `getProfileChecklist` (setup checklist guide), and global constants.

---

### `docs/` (Project Documentation)

- **`docs/FUNCTIONS_STATUS.md`**: Status matrix tracking the state of all 16 core product features.
- **`docs/MEMORY.md`**: Project memory and design decisions log.
- **`docs/SETUP_AND_ACTION_ITEMS.md`**: User setup guide and testing checklist.
- **`docs/PROJECT_STRUCTURE.md`**: This codebase architecture map.
