# Agora — Skill Exchange Network

Agora is a full-stack web application designed to connect individuals looking to swap knowledge, skills, and expertise. Built on a modern tech stack utilizing Next.js (App Router), React, MongoDB, and Socket.IO, it preserves a highly polished presentation layer while enabling robust real-time communication, persistent user states, and complete user security.

---

## 🚀 High-Level Tech Stack

*   **Frontend Framework**: Next.js 16.3.0 (App Router) & React 19
*   **Language**: TypeScript 5.7.3
*   **Styling**: Tailwind CSS v4, Vanilla CSS variables, and Lucide React icons
*   **Database**: MongoDB with Mongoose (with connection pooling & caching layer)
*   **Authentication**: JWT signed tokens stored in secure, HTTP-Only cookies (`auth_token`), and password hashing via `bcryptjs`
*   **Real-Time Layer**: Socket.IO / WebSockets layer for instant chat and status updates

---

## ✨ Key Features

*   **JWT Auth & Session Management**: Complete signup & login flows, session checking via HTTP-only cookie validation, and secure password complexity policy checks (12+ characters, upper/lower/numbers/symbols).
*   **Onboarding & Profile Persistence**: Selection of learning and teaching skills, personalized profile custom links (up to 5, validated), avatar picture selection, pronouns, languages, and country fields.
*   **Explore & Match Search**: Filter and search through member databases using names, skills, and countries. Incorporates match score recommendations (e.g. *⚡ Strong Match* if your teaching skills align with their learning skills and vice versa).
*   **Connection Requests**: A complete connection request workflow (send, cancel, accept, decline) to form verified peer-to-peer relationships.
*   **Real-time 1-to-1 Chat**: Paginated historical conversation logs synced with live Socket.IO events for instant message transfers and read-receipt indicators.
*   **In-App Notifications**: Real-time notifications for incoming connection requests, accepted connections, and new chat messages, complete with a global unread count badge.
*   **Settings & Privacy**:
    *   Dark / Light mode appearance preference.
    *   Notifications enable/disable toggling.
    *   Blocking & Unblocking members.
    *   Report and flag inappropriate users.
    *   Secure account deletion (performs cascade cleanup of data).

---

## 📁 Directory Architecture Map

```text
app/                        # Next.js App Router Root
├── api/                    # Server-side API Route Handlers
│   ├── auth/               # Registration, Login, Logout, Session (me)
│   ├── connections/        # Connection Request handlers and lists
│   ├── conversations/      # Chat conversation room managers
│   ├── messages/           # Chat history and send endpoints
│   ├── notifications/      # Notification list and read-state updates
│   ├── user/               # Settings, profile, blocking, reporting, account deletion
│   └── users/              # Paginated user search and explore list
├── globals.css             # Tailwind v4 entry and theme configurations
├── layout.tsx              # Core HTML structure & global layouts
└── page.tsx                # Application shell mounting components

components/                 # Presentation React Components
├── ui/                     # Shadcn / Radix baseline primitives
├── AuthModal.tsx           # Authentication UI & onboarding steps
├── Avatar.tsx              # Custom avatar initials component
├── Chip.tsx                # Skill badge tags
├── Modal.tsx               # Backdrop modal overlays
├── ProfileView.tsx         # User profile manager & setup checklist
├── SettingsView.tsx        # Dark theme, blocking lists & safety zone
└── agora-app.tsx           # Application view coordinator & state manager

lib/                        # Backend and Utility Helpers
├── db/                     # Mongoose connection & data schemas
│   ├── models/             # Schema definitions (User, Block, Notification, etc.)
│   └── mongodb.ts          # Caching MongoDB connection layer
├── auth.ts                 # JWT token signer, cookie setter, & password hasher
├── email.ts                # Resend API email verification helper
├── prototype-utils.ts      # Match score algorithms, metrics, & initial seed data
└── utils.ts                # Class merge utility (cn)
```

---

## 🛠️ Environment Configuration

Create a `.env` file in the root of the directory:

```env
MONGODB_URI=mongodb+srv://...     # MongoDB connection string
JWT_SECRET=your_jwt_secret        # Secret key for signing auth cookies
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
RESEND_API_KEY=re_...            # Resend key for OTP email verification
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Run Development Server
```bash
npm run dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Build for Production
```bash
npm run build
npm start
```
