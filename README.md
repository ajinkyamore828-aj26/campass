# CampusPass (campass) — College Event Registration & Digital Pass Management System

CampusPass is an institutional web platform designed for college festivals, technical hackathons, cultural fests, workshops, sports events, and dining passes. Built with React 19, TypeScript, Vite, Tailwind CSS v4, and Node.js/Express, styled with the **Demostack Dashboard** design system and **Watermelon UI** primitives.

---

## Key Highlights

- **Event Discovery & Multi-Event Applications**: Browse, search (`⌘K`), and filter events across 8 categories with live capacity tracking.
- **Smart Optical Credential Wallet**: High-resolution QR passes featuring holographic security headers, corner viewfinder reticles, turnstile check-in watermarks, and full-screen scanner presentation mode.
- **Complimentary Meal Vouchers**: Single-use dining passes with dietary tags (`Vegetarian`, `Non-Vegetarian`, `Jain Diet`) and atomic anti-fraud redemption.
- **Volunteer Turnstile Scanner HUD**: Dual-mode entry gate and dining counter verification console with optical viewfinder, instant status verdicts, and 1-click test simulation.
- **Organizer Operations Studio**: Review queues, 1-click participant CSV export, attendance telemetry, and event publishing studio.
- **Central Administrative Governance Center**: User role assignments, pass revocation controls, compliance audit trail, and campus-wide notice broadcasting.
- **Demostack Design Architecture**: Floating navigation sidebar, topbar breadcrumbs, notification popover center, KPI metric cards, and responsive bento layouts.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Design System**: Demostack Dashboard (`demostack-dashboard`) + Watermelon UI component library
- **Backend API**: Express, TypeScript, RESTful endpoints
- **Security**: HMAC-SHA256 digital pass signing, anti-passback turnstile validation

---

## Quickstart

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running Locally

1. Start the backend server (port 4000):
   ```bash
   npm run server
   ```

2. Start the Vite development server (port 5173):
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173/` in your browser.

---

## License

MIT License. Designed and engineered for institutional college event management.
