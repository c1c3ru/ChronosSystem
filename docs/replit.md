# Chronos System - Employee Time Tracking System

## Overview

Chronos System is a modern electronic time clock application built with Next.js 14, designed specifically for managing intern/employee attendance tracking. The system features QR code-based check-ins, comprehensive admin controls, and a Progressive Web App (PWA) for mobile access.

**Key Features:**
- QR code-based attendance tracking with HMAC security
- Admin dashboard for user and machine management
- Employee portal with personal attendance history
- Kiosk mode for shared check-in terminals
- Two-factor authentication (2FA) support
- Work hours tracking and reporting
- Absence justification system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Framework & Runtime:**
- Next.js 14.0.3 with App Router architecture
- TypeScript 5.2.2 for type safety
- Node.js 18+ runtime

**Database & ORM:**
- Prisma 5.6.0 as the ORM layer
- Designed for PostgreSQL (schema defined), but can use SQLite for development
- Database URL configured via environment variable

**Authentication:**
- NextAuth.js 4.24.5 for session management
- Multiple authentication providers:
  - Credentials (email/password with bcrypt)
  - Google OAuth 2.0
  - Two-factor authentication (TOTP via speakeasy)
- JWT-based sessions with refresh token support

**Frontend UI:**
- Tailwind CSS 3.3.5 for styling
- Custom component library built on top of base UI primitives
- Framer Motion 10.16.5 for animations
- Lucide Icons for iconography
- Recharts 2.8.0 for data visualization

**Form Handling:**
- React Hook Form 7.48.2 for form state management
- Zod 3.22.4 for schema validation
- Integration between form library and validation schema via @hookform/resolvers

**QR Code System:**
- `qrcode` library for generation
- `html5-qrcode` for scanning via camera
- `jsqr` as fallback for QR detection
- HMAC-SHA256 signatures for security
- Anti-replay protection using nonces

### Application Structure

The application follows Next.js 14 App Router conventions:

**Route Organization:**
- `/` - Landing page with system overview
- `/admin/*` - Administrative dashboard and controls
- `/employee/*` - Employee portal and attendance views
- `/kiosk` - Shared terminal for QR code display
- `/auth/*` - Authentication flows (signin, complete-profile, 2FA)
- `/api/*` - Backend API routes

**Key Architectural Decisions:**

1. **Monolithic Next.js Application**: Consolidated frontend and backend into a single Next.js application rather than separate services. This simplifies deployment, reduces infrastructure complexity, and leverages Next.js server-side rendering capabilities.

2. **App Router Over Pages Router**: Uses Next.js 14's App Router for better server component support, improved data fetching patterns, and built-in loading/error states.

3. **QR Code Security Model**: 
   - Each QR code contains a signed payload with machine ID, timestamp, nonce, and expiration
   - HMAC-SHA256 signature prevents tampering
   - 60-second expiration window balances security with usability
   - Nonce tracking prevents replay attacks
   - Hash chain for attendance records ensures audit trail integrity

4. **Role-Based Access Control**: Three-tier permission system (ADMIN, SUPERVISOR, EMPLOYEE) enforced through middleware and API route guards.

5. **Progressive Web App**: Service worker implementation enables offline functionality and installable mobile experience for employees.

6. **Database Schema Design**:
   - Users table with profile completion tracking
   - Machines table for QR-generating kiosks
   - Attendance records with geolocation and hash chains
   - QR events table for tracking code generation and usage
   - Work summaries for aggregated time tracking
   - Absence justifications with approval workflow

### Security Architecture

**QR Code Security** (`/lib/qr-security.ts`):
- Payload includes: machineId, timestamp, nonce, expiresIn, version
- HMAC-SHA256 signature using secret key from environment
- Timing-safe comparison for signature validation
- In-memory nonce cache with automatic cleanup
- Hash chain linking for attendance record integrity

**Authentication Flow**:
1. User signs in via credentials or Google OAuth
2. NextAuth creates session with JWT
3. Middleware enforces authentication on protected routes
4. Profile completion check redirects incomplete profiles
5. Optional 2FA verification for enhanced security

**API Security**:
- Environment-based secrets (never hardcoded)
- CORS headers configured for camera/geolocation access
- Request validation using Zod schemas
- Protected routes use NextAuth session checks

### Data Flow

**Attendance Registration Flow**:
1. Kiosk generates QR code via `/api/kiosk/qr` (60-second validity)
2. QR payload stored in database with nonce and expiration
3. Employee scans QR via mobile PWA
4. Scan triggers `/api/attendance/qr-scan` with payload
5. Backend validates: signature → expiration → nonce uniqueness → machine exists
6. Attendance record created with timestamp, location, previous record hash
7. QR event marked as used to prevent reuse

**Work Hours Tracking**:
- Automatic calculation from attendance entry/exit pairs
- Daily, weekly, and monthly summaries
- Contract-based tracking (start date, end date, total hours)
- Validation of maximum daily hours and required sequences
- Projection of completion dates based on current pace

## External Dependencies

### Third-Party Services

**Google OAuth 2.0**:
- Client ID and Secret configured via environment variables
- Used for social login authentication
- Callback URL: `/api/auth/callback/google`

**Database**:
- PostgreSQL recommended for production (via DATABASE_URL)
- SQLite acceptable for development
- Connection pooling handled by Prisma

### Deployment Platforms

**Vercel** (Primary):
- Configured via `vercel.json`
- Environment variables: NEXTAUTH_URL, NODE_ENV
- Headers configured for camera/microphone permissions
- Function timeout: 30 seconds for API routes
- Preferred region: gru1 (South America)

**Required Environment Variables**:
```
DATABASE_URL - PostgreSQL connection string
NEXTAUTH_URL - Base URL for authentication callbacks
NEXTAUTH_SECRET - Secret for NextAuth session encryption
QR_SECRET - HMAC secret for QR code signing
GOOGLE_CLIENT_ID - Google OAuth client ID
GOOGLE_CLIENT_SECRET - Google OAuth client secret
```

### Testing Infrastructure

**Unit Tests**:
- Jest with React Testing Library
- Coverage thresholds: 70% across all metrics
- Mock setup for NextAuth and Next.js navigation

**E2E Tests**:
- Playwright for browser automation
- Tests for authentication flows, QR scanning, profile completion
- Multi-browser support (Chromium, Firefox, WebKit)
- Screenshot and video capture on failures

**Performance**:
- Lighthouse CI configured (`.lighthouserc.json`)
- Minimum scores: 80% performance, 90% accessibility/best-practices, 80% SEO

### PWA Capabilities

**Service Worker** (`/public/sw.js`):
- Offline page caching
- Static asset caching strategy
- Network-first for API requests
- Fallback to offline page when network unavailable

**Manifest** (`/public/manifest.json`):
- Installable on mobile devices
- Standalone display mode
- Custom app icons and theme colors
- Configured for employee attendance tracking use case