# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # Start dev server on port 2001
pnpm build          # Production build → dist/
pnpm preview        # Preview production build
pnpm lint           # ESLint (src only)
pnpm lint:fix       # ESLint with auto-fix
pnpm test           # Run tests once (Vitest)
pnpm test:watch     # Run tests in watch mode
pnpm test:ui        # Vitest UI
pnpm test:coverage  # Coverage report
```

Run a single test file:
```bash
pnpm vitest run tests/services/project.service.test.ts
```

## Architecture

This is a **Vue 3 micro-frontend remote** served via Module Federation v2 (Rsbuild/Rspack), consumed by a React shell application.

### Entry points

- `src/main.ts` — standalone dev mode, mounts to `#taskbolt`
- `src/bootstrap.ts` — federated mode, exports `mount(el)` and `unmount()` called by the shell
- The shell accesses this app via `dist/remoteEntry.js`

### Shell services — critical dependency

The app **cannot function** without `window.__SHELL_SERVICES__` provided by the React shell. All services come through this global registry:

```typescript
// Access pattern — always check for null
const { getApiClient, getToastService } = useShellServices()
const apiClient = getApiClient() // ApiClient | null
```

Services provided by shell:
- **`ApiClient`** — HTTP with auto-auth (`apiClient.request(url, options)`)
- **`ToastService`** — Notifications (`toast.success/error/warning/info`)
- **`i18n`** — i18next instance (app registers `taskbolt` namespace on mount)

### Data flow

```
React Shell → window.__SHELL_SERVICES__ → useShellServices() → Feature Components
                                                                       ↓
                                                          shared/services/*.service.ts
                                                          (accept ApiClient as first arg)
```

### Feature structure

Features are self-contained under `src/features/{feature-name}/`:

```
features/
├── home/              # Home / dashboard
├── active-sprint/     # Active sprint view
├── backlogs/          # Task CRUD (most complex feature)
├── reports/           # Reporting views
├── configure/         # Config — nested routes for projects
└── projects/          # Project detail (child of configure)
```

### Routes

| Name | Path | Notes |
|---|---|---|
| `home` | `/:projectId?/home` | Default redirect from `/` |
| `active-sprint` | `/:projectId?/active-sprint` | |
| `backlogs` | `/:projectId?/backlogs` | `?task=<id>` pre-selects a task |
| `task-link` | `/tasks/:taskId` | Resolves a bare task id, redirects into `backlogs` |
| `reports` | `/:projectId?/reports` | |
| `configure-home` | `/configure/:projectId?` | Parent layout; own `:projectId` semantics, not part of the shared prefix below |
| `project-list` | `/configure/projects` | |
| `project-detail` | `/configure/projects/:projectId` | |

`home`, `active-sprint`, `backlogs`, and `reports` share an optional `:projectId` URL prefix kept in sync with the sidebar's selected-project context via `useProjectRouteSync()` (`src/shared/composables/useProjectRouteSync.ts`) — call it once per page. No prefix means the personal workspace; selecting a project rewrites the URL to include it, and opening a project-scoped URL directly selects that project.

**Always use named routes** — base path changes in shell (`/dashboard/taskbolt`):
```typescript
router.push({ name: 'backlogs' })    // ✅
router.push('/backlogs')             // ❌
```

### State management

No global store. State is managed via:
1. Component-local `ref()`/`reactive()` in `<script setup>`
2. Composables in `src/shared/composables/`
3. Route params via Vue Router

### API services pattern

```typescript
// src/shared/services/*.service.ts
export const getTasks = async (apiClient: ApiClient, filter = {}) => {
  const response = await apiClient.request(`${APP_AUTH_URL}/tasks?...`, { method: 'GET' })
  if (!response.ok) throw new Error(`Failed to fetch tasks (${response.status})`)
  return await response.json()
}
```

Base URL: `APP_AUTH_URL` env var, default `http://localhost:8888`.

## Critical rules (from `.github/copilot-instructions.md`)

1. **Shell services** — Always use `useShellServices()`, never access `window.__SHELL_SERVICES__` directly
2. **i18n** — Use `useTaskboltTranslation()` for all user-facing text, namespace `taskbolt`
3. **Component `class` prop** — Shared UI components must accept `class` prop and merge with `cn(baseClasses, props.class)`
4. **Props forwarding** — Use `useForwardProps()` from reka-ui for headless UI wrappers

## Component conventions

- All components use `<script setup lang="ts">` (Options API prohibited)
- Page components are suffixed `Page` (e.g. `BacklogsPage.vue`)
- Shared UI lives in `src/shared/components/ui/{component-name}/` with an `index.ts` barrel export
- Import shared components from barrel: `import { Button } from '@/shared/components/ui/button'`
- Use `@/` alias for all src imports

### Styling

- Tailwind v4 utility classes in templates
- `cn()` from `@/shared/lib/utils` to merge class names (wraps `clsx` + `tailwind-merge`)
- `class-variance-authority` (CVA) for systematic component variants

## Testing

Tests live in `tests/`, mirroring the source structure. Shell services must be mocked — see `tests/mocks/shell-services.ts` for the established mock pattern. Tests use `happy-dom` as the DOM environment.

## Docs

`docs/codebase/` contains detailed architecture documentation:
- `ARCHITECTURE.md` — Data flow and patterns
- `CONVENTIONS.md` — Naming, typing, and error handling rules
- `STRUCTURE.md` — Directory reference
- `INTEGRATIONS.md` — Shell service interfaces
- `CONCERNS.md` — Known tech debt
