# Setup & Action Items (User Guide)

This document details the exact setup steps and manual action items required on your end to run, configure, and test the **Skill Exchange Network** full-stack application.

---

## 1. Environment Variables Configuration (`.env`)

Open the `.env` file located in the root of the project:

```env
MONGODB_URI=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key_here
```

### Action Items:

1. **`MONGODB_URI`**
   - Provide a valid MongoDB connection string.
   - **Option A (MongoDB Atlas Cloud)**:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/skill-exchange?retryWrites=true&w=majority
     ```
   - **Option B (Local MongoDB)**:
     ```env
     MONGODB_URI=mongodb://127.0.0.1:27017/skill-exchange
     ```
   > [!IMPORTANT]
   > Make sure your MongoDB instance is running and your IP address is whitelisted in MongoDB Atlas Network Access if using Atlas.

2. **`JWT_SECRET`**
   - Provide a secure secret key used to sign and verify authentication JWT cookies.
   - Example:
     ```env
     JWT_SECRET=super-secret-random-key-change-this-in-production-12345!
     ```

---

## 2. Running the Development Server

1. Open your terminal in the project root directory.
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 3. End-to-End Manual Testing Checklist

Once `.env` is configured and the dev server is running, perform the following verification flow:

- [x] **Account Registration**: Click "Log in" / "Create account", enter an email and password (min 6 chars). Verify you are registered and logged in.
- [x] **Onboarding**: Select at least one skill to learn and one skill to teach, then click finish. Verify state persists on refresh.
- [x] **Profile Editing**: Go to the "Profile" tab, update your bio, country, profile picture, skills, and links (up to 5). Click "Save profile". Reload the page and verify your profile data is retained.
- [x] **Explore & Search**: Go to "Explore". Search for users by name or skill. Use "Can teach", "Wants to learn", and "⚡ Strong matches" filters.
- [x] **Connection Flow**: Send a connection request directly via the Connection Request Modal.
- [x] **Respond to Request**: Log in as recipient, go to "Notifications", and click "Accept" on the incoming connection request.
- [x] **1-to-1 Messaging**: Navigate to "Messages". Select connected partner, send a message. Verify message history persists in MongoDB.
- [x] **Account Settings**: Test Light/Dark appearance mode, notification toggle, desktop profile dropdown menu, blocking a user, and account deletion.

---

## Summary of Automated Tests

To verify that the code compiles without TypeScript errors or build issues, you can run:

```bash
# Type check
npx tsc --noEmit

# Production build test
npm run build
```
