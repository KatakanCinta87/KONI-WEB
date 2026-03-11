# Repo Map

Status date: `2026-03-10`

## Top Level

```text
KONI-WEB/
|-- apps/
|   |-- api/                  # Express + Prisma backend
|   `-- web/                  # React + Vite frontend
|-- packages/
|   |-- types/                # Shared TypeScript package
|   `-- ui/                   # Shared UI package skeleton
|-- .env.example              # Example environment values
|-- .gitignore                # Shared ignore rules
|-- AGENTS.md                 # Repo-specific agent instructions
|-- CURRENT_STATE_MAP.md      # Current project state summary
|-- PROJECT_MEMORY.md         # Working memory for continuation
|-- README.md                 # Repo overview and local run guide
|-- REMAINING_PLAN.md         # Completion status and next workstream
|-- PRD_KONI_KabMalang.md     # Product requirements
|-- TRD_KONI_KabMalang.md     # Technical requirements
|-- docker-compose.yml        # Local service orchestration
|-- package.json              # Workspace root scripts
|-- package-lock.json         # npm workspace lockfile
|-- run.bat                   # Windows helper entrypoint
`-- turbo.json                # Turborepo pipeline config
```

## `apps/api`
- `package.json`: API scripts, Prisma pin `6.2.1`, verify runner, seed runner.
- `prisma/`
  - `schema.prisma`: main database model.
  - `seed.ts`: seed data.
  - `migrations/`: migration history, including event + medal updates.
- `scripts/`
  - `verify-phase2.ts`: automated API verification flow.
- `src/`
  - `index.ts`: Express bootstrap, CORS, uploads, route registration, health, public contact/news.
  - `routes/`: auth, admin, athletes, coaches, cabor, events, gallery, news, sk.
  - `controllers/`, `services/`, `middleware/`, `lib/`: implementation and support layers.
- `uploads/`: local runtime upload storage and should stay out of Git.

## `apps/web`
- `package.json`: Vite frontend scripts.
- `src/`
  - `App.tsx`: public/admin router and protected route wiring.
  - `components/layout/`: public layout and admin layout.
  - `context/`: auth context.
  - `lib/`: axios and client helpers.
  - `pages/`: public pages plus admin pages for dashboard, athletes, coaches, news, events, gallery, cabors, users, SK, audit logs, settings, and login.
  - `services/`: frontend data access helpers.
- `vite.config.ts`: Vite config.

## `packages`
- `packages/types`: shared TypeScript package currently tracked in repo.
- `packages/ui`: shared UI package skeleton; currently minimal.

## Important Docs in Repo
- `README.md`: current setup and run instructions.
- `PROJECT_MEMORY.md`: preserved implementation memory and operational notes.
- `REMAINING_PLAN.md`: completion status and approved next workstream.
- `CURRENT_STATE_MAP.md`: concise state baseline.
- `REPO_MAP.md`: structural map of the repository.

## Intentionally Ignored Local-Only Files
- `.agent-browser-profile/`
- `.browseruse/`
- `artifacts/`
- `apps/api/uploads/`
- `*.tsbuildinfo`
- `__pycache__/`
- `*.pyc`
- `prisma_error.txt`
- `*.bak`
- `test-upload.png`
