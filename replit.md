# DeskGuard

Smart library seat booking and study management app with 7 innovative features built on top of a real-time seat map.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, serves `/api`)
- `pnpm --filter @workspace/deskguard run dev` — run the frontend (port 22877, serves `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — cookie session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + cookie-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite, Tailwind CSS v4, Framer Motion, Recharts, Wouter, Lucide
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — all DB tables (users, seats, sessions, activity, noise, queue, lostfound, occupancylogs)
- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/api-client-react/src/generated/` — generated hooks and Zod schemas (do not edit manually)
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/deskguard/src/pages/` — frontend pages
- `artifacts/deskguard/src/components/` — shared components (Navbar, SeatCard, SeatDetailPanel)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → typed React Query hooks + Zod schemas
- All generated hooks require `queryKey` to be passed explicitly in the `query` option
- Cookie-session (not express-session) for auth — stored in signed cookies
- Occupancy logs are auto-recorded on every forecast fetch for historical ML data
- Gamification is computed from existing study_sessions — no separate badge table needed
- Noise reports auto-expire after 30 minutes (filtered in queries, not deleted)

## Product

- **Library Map** — real-time seat grid across 4 zones, check-in/away/checkout
- **Smart Seat Recommendation** — scores available seats by noise preference, power needs, group size
- **Queue & Auto-Allocation** — join a waitlist when all seats are full
- **Noise Heatmap** — community-reported per-zone noise levels (expires in 30 min)
- **Occupancy Forecast** — 8-hour chart with confidence levels, built from historical data
- **Gamified Study Streaks** — badges, streaks, weekly leaderboard
- **Lost & Found Assistant** — report and claim found items at desks
- **Admin Dashboard** — real-time stats, zone heatmap, abandoned desk alerts

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`
- Run `pnpm --filter @workspace/db run push` after adding new tables to `lib/db/src/schema/`
- Generated hooks from Orval require `queryKey` in options (see generated api.ts signature)
- `useLogout.mutate()` takes no argument (void), not `{}`
- Do NOT run `pnpm dev` at workspace root — use `restart_workflow` instead

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
