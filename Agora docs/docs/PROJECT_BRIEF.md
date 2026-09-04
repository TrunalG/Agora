# Agora - Project Brief

## Overview
Agora is a modern, premium Peer-to-Peer Skill Exchange Platform designed to connect professionals who want to learn new skills with those who can teach them. It focuses on reciprocal learning, allowing users to trade their expertise seamlessly.

## Technology Stack
- **Framework**: Next.js (App Router) for both frontend and server-side API rendering.
- **Language**: TypeScript for end-to-end type safety.
- **Styling & UI**: Tailwind CSS v4, Vanilla CSS variables for custom aesthetic theming, and Lucide React for consistent iconography. Modern glassmorphism and micro-animations are heavily utilized.
- **Database**: MongoDB with Mongoose as the ODM, featuring a cached connection layer for optimized serverless performance.
- **Real-Time Communication**: Socket.IO / WebSockets layer to power instant messaging and live connection updates.

## How Things Work Behind the Scenes
1. **Smart Matchmaking Engine**: The core algorithm computes compatibility scores instantly. It cross-references the skills a user wishes to learn against what other members want to teach, surfacing high-quality, mutual pairings.
2. **Advanced Discovery**: Users can fine-tune their search using granular filters (e.g., location, specific skill tags, and match score) to find the exact peer they need.
3. **Guarded Inbox Flow**: To maintain a high-quality ecosystem, messaging is isolated. Users must send connection requests with personalized notes. Direct messaging is only unlocked once a request is mutually accepted.

## Security & Privacy Protocols
- **Secure Authentication**: User sessions are managed using JWT (JSON Web Tokens). These tokens are strictly stored in **HTTP-Only cookies**, preventing cross-site scripting (XSS) attacks from accessing them.
- **Data Protection**: Sensitive user data, such as passwords, are heavily encrypted and hashed using `bcryptjs` before being stored in the database.
- **Zero-Noise Moderation**: The platform enforces a strict zero-spam policy. Users have control over their profile visibility, can block unwanted connections, and flag suspicious behavior to ensure a safe learning workspace.
- **API Route Protection**: All protected backend endpoints verify the JWT signature and user permissions before serving any private data or performing actions.
