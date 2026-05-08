# Project Structure

**Evidence-Based Analysis** — All claims cite source directories/files.

## Root Configuration Files

| File | Purpose | Source |
|------|---------|--------|
| `package.json` | Dependencies, scripts, package manager | Root |
| `pnpm-lock.yaml` | Dependency lock file | Root |
| `pnpm-workspace.yaml` | Monorepo workspace config | Root |
| `rsbuild.config.ts` | Build configuration (Rsbuild + Module Federation) | Root |
| `tsconfig.json` | TypeScript compiler options | Root |
| `postcss.config.js` | PostCSS + Tailwind + Autoprefixer | Root |
| `components.json` | shadcn-vue component configuration | Root |

## Source Directory (`src/`)

### Entry Points

- **`main.ts`** — Standalone development entry (mounts to `#taskbolt`) — (Source: src/main.ts)
- **`bootstrap.ts`** — Module Federation entry with `mount()` and `unmount()` lifecycle — (Source: src/bootstrap.ts)
- **`App.vue`** — Root Vue component (default export for component loaders) — (Source: src/bootstrap.ts)
- **`index.html`** — HTML template — (Source: src/index.html)

### Type Definitions (`src/`)

- `env.d.ts` — Environment types
- `shims-vue.d.ts` — Vue SFC declarations
- `shims-css.d.ts` — CSS module declarations

### Features (`src/features/`)

**Pattern:** Each feature is a subdirectory containing all related components.

#### `active-sprint/`
- `ActiveSprintPage.vue` — Main active sprint view
- `HomePage.vue` — [TODO: Determine relationship to ActiveSprintPage]

#### `backlogs/`
- `BacklogsPage.vue` — Main backlogs view
- `TaskAccordion.vue` — Task list display component
- `TaskDetail.vue` — Task detail view
- `TaskForm.vue` — Create/edit task drawer wrapper
- `TaskFormFields.vue` — Task form field components
- `index.ts` — Public exports

#### `reports/`
- `ReportsPage.vue` — Reports view

#### `configure/`
- `ConfigurePage.vue` — Configuration view

### Router (`src/router/`)

- `index.ts` — Route definitions and router factory (`createAppRouter`)

**Routes defined:**
- `/` → Redirect to `/active-sprint`
- `/active-sprint` (name: `active-sprint`)
- `/backlogs` (name: `backlogs`)
- `/reports` (name: `reports`)
- `/configure` (name: `configure`)

(Source: src/router/index.ts)

### Shared (`src/shared/`)

#### Components (`src/shared/components/`)

##### Layout Components (`layout/`)
- `AppLayout.vue` — Main layout wrapper
- `AppSidebar.vue` — Application sidebar

##### UI Components (`ui/`)

Each UI component lives in its own directory with an `index.ts` barrel export:

- **`button/`** — Button primitive with variants (Source: components.json)
- **`drawer/`** — Drawer (side panel) components using Vaul Vue
  - `Drawer.vue`, `DrawerClose.vue`, `DrawerContent.vue`, `DrawerDescription.vue`, `DrawerFooter.vue`, `DrawerHeader.vue`, `DrawerOverlay.vue`, `DrawerTitle.vue`, `DrawerTrigger.vue`
- **`dropdown-menu/`** — Dropdown menu components
  - `DropdownMenu.vue`, `DropdownMenuContent.vue`, `DropdownMenuGroup.vue`, `DropdownMenuItem.vue`, `DropdownMenuLabel.vue`, `DropdownMenuSeparator.vue`, `DropdownMenuTrigger.vue`
- **`input/`** — Text input component
- **`markdown-editor/`** — Markdown editor (Lexical-based)
- **`select/`** — Select dropdown components
  - `Select.vue`, `SelectContent.vue`, `SelectItem.vue`, `SelectTrigger.vue`, `SelectValue.vue`
- **`task-item/`** — Task-specific components
  - `TaskItem.vue`, `TaskItemPriority.vue`, `TaskTypeIcon.vue`

(Source: src/shared/components/ui/)

#### Composables (`src/shared/composables/`)

- **`useProject.ts`** — Project state management
- **`useShellServices.ts`** — Shell service access and wrapper functions
  - Exports: `useShellServices()`, `useTaskboltTranslation()`, `getShellServiceRegistry()`, etc.

(Source: src/shared/composables/)

#### i18n (`src/shared/i18n/`)

- `translations.ts` — English translations for `taskbolt` namespace

Namespaces:
- `sidebar`, `header`, `activeSprint`, `backlogs`, `reports`, `configure`, `common`, `taskForm`, `taskStatus`, `taskType`, `taskPriority`

(Source: src/shared/i18n/translations.ts)

#### Library Code (`src/shared/lib/`)

- **`constants.ts`** — App-wide constants (e.g., `APP_AUTH_URL`)
- **`form-validation.ts`** — Form validation utilities
- **`utils.ts`** — General utilities (e.g., `cn()` for class names)

(Source: src/shared/lib/)

#### Plugins (`src/shared/plugins/`)

- `shell-services.ts` — Vue plugin to provide shell services to app

(Source: src/shared/plugins/)

#### Services (`src/shared/services/`)

- **`index.ts`** — Service barrel exports
- **`project.service.ts`** — Project-related API calls
- **`task.service.ts`** — Task-related API calls (e.g., `getTasks()`)

(Source: src/shared/services/)

#### Styles (`src/shared/styles/`)

- `globals.css` — Global CSS and Tailwind directives

(Source: src/shared/styles/)

#### Types (`src/shared/types/`)

- **`project.ts`** — Project-related type definitions
- **`task.ts`** — Task types: `Task`, `TaskType`, `TaskStatus`, `TaskPriority`
- **`shell-services.ts`** — Shell service interfaces: `ShellServiceRegistry`, `ToastService`, `ApiClient`, `I18nService`
- **`root.d.ts`** — Global type augmentations (e.g., `window.__SHELL_SERVICES__`)

(Source: src/shared/types/)

### Assets (`src/assets/`)

- `icons/` — Icon assets (SVG files processed as `asset/resource` by Rspack)

(Source: src/assets/, rsbuild.config.ts)

## GitHub Configuration (`.github/`)

- **`copilot-instructions.md`** — AI coding assistant rules
- **`skills/`** — Custom agent skills
  - `acquire-codebase-knowledge/` — Codebase documentation generator
  - `list-changes/` — Git change listing workflow

## Documentation (`docs/`)

- `codebase/` — Generated codebase documentation (this directory)

## Build Output (`dist/`)

- Generated by Rsbuild during build process
- **Not tracked in version control** — (Source: .gitignore assumption)

## Alias Configuration

**Path Aliases:**
- `@/*` → `./src/*` — (Source: tsconfig.json, rsbuild.config.ts, components.json)

**Component Aliases (shadcn-vue):**
- `components` → `@/shared/components/ui`
- `composables` → `@/shared/composables`
- `utils` → `@/shared/lib/utils`
- `ui` → `@/shared/components/ui`
- `lib` → `@/shared/lib`

(Source: components.json)

## File Naming Conventions

**Observed patterns:**
- **Vue Components:** PascalCase with `.vue` extension (e.g., `TaskForm.vue`, `BacklogsPage.vue`)
- **TypeScript files:** camelCase with `.ts` extension (e.g., `task.service.ts`, `useProject.ts`)
- **Config files:** kebab-case or standard names (e.g., `rsbuild.config.ts`, `package.json`)
- **Barrel exports:** `index.ts` in component directories

## Architecture Layers (Top to Bottom)

1. **Pages** (`src/features/{feature}/`) — Route-level components
2. **Layout** (`src/shared/components/layout/`) — App structure
3. **Feature Components** — Business logic components
4. **Shared UI** (`src/shared/components/ui/`) — Reusable primitives
5. **Services** (`src/shared/services/`) — API communication
6. **Composables** (`src/shared/composables/`) — Reusable logic
7. **Utilities** (`src/shared/lib/`) — Pure functions
8. **Types** (`src/shared/types/`) — Type definitions
