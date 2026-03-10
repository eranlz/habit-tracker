# Nexus — Habit Tracker

A local-first PWA habit tracker by [Polychrome](https://polychrome.io). No backend, no account sync — all data lives in your browser's localStorage.

## Features

- **Active habits** — track progress toward a numeric target (e.g. "Run 5 km/day")
- **Passive habits** — succeed by default each day; mark failed only when you break them
- **Daily & weekly frequency** — active habits can target either period
- **Streaks** — consecutive successful periods, counted in days
- **Day rollover** — previous period is committed automatically when you open the app on a new day
- **Per-user data** — multiple users can share a device; each sees only their own habits
- **PWA** — installable on iOS and Android, works offline

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
```

On first load you'll be prompted to create an account (name + password). Passwords are hashed with SHA-256 before storage — they never leave the device.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # Production build → dist/
npm run preview    # Serve the production build locally
npm run lint       # ESLint (zero-warnings policy)
npx tsc --noEmit   # Type-check without building
```

## Tech Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS v3 (dark mode) |
| State | Zustand v5 + localStorage persistence |
| Animation | framer-motion v11 |
| Icons | lucide-react |
| Dates | date-fns v3 |
| PWA | vite-plugin-pwa (Workbox) |

## Project Structure

```
src/
  components/       UI components (GoalCard, UpdateModal, LoginDialog, …)
  hooks/            useRollover, useUserGoals
  lib/              dateUtils, rollover, streakEngine, statusUtils
  store/            useGoalStore (goals), useAuthStore (users)
  types/            Goal, ActiveGoal, PassiveGoal, HistoryEntry
```

## Data Storage

| Key | Contents |
|---|---|
| `nexus-auth-v1` | User registry (id, name, SHA-256 password hash) |
| `nexus-goals-v1` | Per-user goals and rollover timestamps |
