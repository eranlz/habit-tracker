# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server (http://localhost:5173)
npm run build      # tsc + Vite production build → dist/
npm run preview    # Serve the production build locally
npm run lint       # ESLint — zero warnings policy (will fail on any warning)
npx tsc --noEmit   # Type-check without building
```

No test framework is configured.

## Architecture

### Data model
Two goal variants share a `BaseGoal` base (`id`, `name`, `streak`, `history[]`):
- **`ActiveGoal`** — user logs progress toward a numeric `target`; has `frequency: 'daily' | 'weekly'`, `currentCount`, and `currentPeriodKey`.
- **`PassiveGoal`** — succeeds by default each day; flipped to failed by user action; has `isFailed` and `currentDayKey`.

`HistoryEntry` records `{ periodKey, count, succeeded }` per period. Period keys are ISO date strings (`"2026-03-10"`) for daily and ISO week strings (`"2026-W10"`) for weekly. History is capped at 90 entries.

### State
Single Zustand store (`src/store/useGoalStore.ts`) persisted to `localStorage` under key `nexus-goals-v1`. The store holds `goals[]` and `lastOpenedAt` (ISO timestamp used by rollover).

### Day rollover (`src/lib/rollover.ts` + `src/hooks/useRollover.ts`)
`useRollover()` fires once on app mount. It calls `computeRollover(goals, lastOpenedAt)`, which compares `startOfDay(lastOpenedAt)` with `startOfDay(now)`. If a day boundary has passed:
- The current period is committed to `history` with its actual result.
- Gap days between last open and today are back-filled: active gaps → `succeeded: false`; passive gaps → `succeeded: true` (passive succeeds by default).
- Weekly goals only roll over when the ISO week key changes.
- Streaks are recalculated and counts/flags reset.

### Streak calculation (`src/lib/streakEngine.ts`)
Walks `history` sorted descending by `periodKey`, counting consecutive `succeeded: true` entries. The result is always in **days**: daily goals count 1 day per period; weekly goals count 7 days per period.

### Status & colors (`src/lib/statusUtils.ts`)
`deriveStatus(goal)` returns `'success' | 'in-progress' | 'pending' | 'failed'`. The `statusColors` map provides Tailwind class strings (`border`, `bg`, `text`, `pill`) for each status — all color logic lives here to stay DRY.

### UI / component flow
`App.tsx` owns modal state (`'none' | 'add' | 'edit' | 'update'`) and renders:
- `GoalList` → `GoalCard` (read-only display + open-update/edit triggers)
- `UpdateModal` (framer-motion bottom sheet) → `ActiveUpdatePanel` or `PassiveUpdatePanel`
- Add/Edit bottom sheet → `AddGoalForm` or `EditGoalForm`

`ActiveUpdatePanel` subscribes to the store directly (`goals.find(...)`) to get a live `currentCount`, avoiding stale-prop bugs on the ±1 buttons.

### Theme
Tailwind dark mode via `class="dark"` on `<body>`. Custom palette in `tailwind.config.ts`: `surface` `#1a1a2e`, `card` `#16213e`, `accent` `#6366f1`, `success` `#22c55e`, `warning` `#f59e0b`, `danger` `#ef4444`.

### PWA
`vite-plugin-pwa` generates a Workbox service worker and `manifest.webmanifest` at build time. Icons live in `public/icons/`.
