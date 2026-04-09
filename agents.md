# AGENTS.md

This file gives coding agents the minimum context needed to work safely and quickly in this repository.

## Project Purpose
- Proof-of-concept digital TTRPG GM dashboard.
- Frontend: Nuxt 4 + Nuxt UI 4 + Tailwind CSS 4.
- Backend: Nuxt server routes under `server/api`.
- LLM provider: local Ollama endpoint configured in `nuxt.config.ts`.

## Tech Stack
- Language: TypeScript (Vue SFCs + server TS).
- Package manager: `pnpm` (see `packageManager` in `package.json`).
- Linting: ESLint (`pnpm lint`).
- Type checking: Nuxt typecheck (`pnpm typecheck`).

## Repository Layout
- `app/pages/index.vue`: main dashboard composition (chat + secondary/floating panels).
- `app/components/`: UI components (`DashboardChat`, `DashboardMap`, `DashboardJournal`, `DashboardSheet`, `PanelWrapper`).
- `app/composables/`: panel state and floating window behavior (`useDashboardPanels`, `usePanelWindow`, `usePanelDragResize`).
- `app/assets/css/main.css`: global styles + panel shell/floating styles.
- `server/api/chat.post.ts`: chat proxy/streaming endpoint to Ollama.
- `nuxt.config.ts`: modules, global CSS, runtime config (`ollama.baseUrl`, `ollama.model`).

## Development Commands
- Install: `pnpm install`
- Run dev server: `pnpm dev`
- Build: `pnpm build`
- Preview build: `pnpm preview`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`

## Agent Coding Guidelines
- Prefer strict, explicit TypeScript types; avoid `any`.
- Reuse existing composables/utilities before introducing new abstractions.
- Keep functions focused and side effects obvious.
- Follow existing naming and file organization conventions in nearby code.
- Keep UI changes consistent with Nuxt UI patterns already used in this repo.
- Before making implementation decisions, check the latest official docs for Nuxt UI, Nuxt, Vue, and Tailwind CSS.
- Prefer current documented patterns from those stacks when executing tasks in this repo.
- Do not hardcode secrets or environment-specific credentials.

## Chat Flow Notes
- Client (`DashboardChat.vue`) sends messages to `POST /api/chat`.
- Server normalizes messages and streams NDJSON assistant updates.
- Upstream model endpoint is `${runtimeConfig.ollama.baseUrl}/api/chat`.
- If changing message shape, update both client and server in lockstep.

## Validation Checklist For Changes
- Run `pnpm lint` for style/lint issues.
- Run `pnpm typecheck` for TS correctness.
- If UI behavior changes, verify dock/floating panel interactions on the dashboard page.
- If chat behavior changes, verify streaming still works end-to-end against local Ollama.
