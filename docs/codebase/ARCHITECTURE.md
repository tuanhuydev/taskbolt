# Architecture

**Evidence-Based Analysis** — All claims cite source files.

## Architectural Pattern

**Module Federation Remote Application**

This is a **Vue 3 micro-frontend** designed to be consumed by a React shell application via Module Federation v2 (using Rsbuild/Rspack).

### Federation Configuration

```typescript
{
  name: "taskbolt",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App.vue"
  },
  shared: {
    vue: { singleton: true, strictVersion: false, requiredVersion: "^3.4.0", eager: true }
  }
}
```

(Source: rsbuild.config.ts)

### Lifecycle Integration

- **Standalone Mode:** `main.ts` mounts directly to `#taskbolt` element — (Source: src/main.ts)
- **Federated Mode:** `bootstrap.ts` exports `mount(el)` and `unmount()` functions — (Source: src/bootstrap.ts)
  - Shell calls `mount()` with a DOM element or selector
  - Router base path is configurable (production: `/dashboard/taskbolt`)

**[ASK USER]** How does the React shell discover and load this remote? Is there a shell-side configuration file?

## Application Architecture

### Layer Hierarchy

```
┌─────────────────────────────────────────────┐
│           Pages / Routes                     │  ← Feature entry points
├─────────────────────────────────────────────┤
│       Feature Components                     │  ← Business logic
├─────────────────────────────────────────────┤
│     Shared UI Components                     │  ← Reusable primitives
├─────────────────────────────────────────────┤
│    Composables + Services                    │  ← State & API logic
├─────────────────────────────────────────────┤
│         Utilities + Types                    │  ← Pure functions & contracts
└─────────────────────────────────────────────┘
```

### Feature-Based Organization

Each feature is self-contained under `src/features/{feature-name}/`:

```
features/
├── active-sprint/     ← Active sprint management
├── backlogs/          ← Backlog & task CRUD
├── reports/           ← Reporting views
└── configure/         ← Configuration UI
```

(Source: src/features/, .github/copilot-instructions.md)

**Principle:** Features own their domain logic and components. Shared concerns live in `src/shared/`.

### Component Composition Patterns

#### 1. Headless UI + Custom Styling

Components wrap Reka UI / Radix Vue primitives with Tailwind classes:

```vue
<Primitive
  :as="as"
  :as-child="asChild"
  :class="cn(buttonVariants({ variant, size }), props.class)"
>
  <slot />
</Primitive>
```

(Source: src/shared/components/ui/button/Button.vue)

**Pattern:**
- Base: Headless primitive from `reka-ui`
- Styling: `class-variance-authority` for variants + `cn()` for merging
- Customization: Accept `class` prop for consumer overrides

#### 2. Compound Components

UI components export multiple sub-components for composition:

```
drawer/
├── Drawer.vue
├── DrawerContent.vue
├── DrawerHeader.vue
├── DrawerTitle.vue
├── DrawerFooter.vue
└── index.ts  ← Barrel export
```

(Source: src/shared/components/ui/drawer/)

**Usage:**
```vue
<Drawer>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
    </DrawerHeader>
  </DrawerContent>
</Drawer>
```

#### 3. Props Forwarding

For headless UI wrappers, use `useForwardProps()` from reka-ui — (Source: .github/copilot-instructions.md)

**[TODO]** Verify actual usage in codebase (not observed in sampled components).

### State Management

**No global state library detected** (no Pinia, Vuex, or similar) — (Source: package.json analysis)

**State strategies observed:**

1. **Component-local state:** `ref()` and `reactive()` in `<script setup>`
2. **Composables:** Shared logic via composition functions (e.g., `useShellServices()`)
3. **Route params:** Navigation state via Vue Router

**[CONCERN]** Lack of centralized state management may complicate cross-feature data sharing.

### Data Flow

```
┌──────────────────────┐
│  Shell Application   │  ← React host
│  (provides services) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  window.            │  ← Global service registry
│  __SHELL_SERVICES__  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  useShellServices()  │  ← Vue composable wrapper
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Feature Components  │  ← Consume services
└──────────────────────┘
```

(Source: src/shared/types/shell-services.ts, src/shared/composables/useShellServices.ts, src/shared/types/root.d.ts)

**Key services consumed:**
- `ApiClient` — HTTP requests with auth
- `ToastService` — User notifications
- `I18nService` (i18next) — Translations
- **[ASK USER]** What other services does the shell provide?

### Routing Strategy

**Client-Side Routing (SPA)**

- **Router:** Vue Router 4 with Web History API — (Source: src/router/index.ts)
- **Base path:** Configurable at mount time (e.g., `/dashboard/taskbolt` in shell)
- **Fallback:** `historyApiFallback` rewrites all requests to `index.html` — (Source: rsbuild.config.ts)

**Navigation rule:** Use named routes, never absolute paths:

```typescript
// Correct
router.push({ name: 'backlogs' })

// Incorrect (violates copilot-instructions.md)
router.push('/backlogs')
```

(Source: .github/copilot-instructions.md)

**[ASK USER]** How does the shell handle navigation between remotes? Does it sync browser history?

### API Communication

**Pattern:** Service functions accept `ApiClient` from shell services.

```typescript
export const getTasks = async (apiClient: ApiClient, filter: Record<string, unknown> = {}) => {
  const response = await apiClient.request(`${APP_AUTH_URL}/tasks?...`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  // ...
}
```

(Source: src/shared/services/task.service.ts)

**Key characteristics:**
- **No direct fetch/axios:** All requests go through shell's `ApiClient`
- **Authentication:** Handled automatically by `ApiClient.request()`
- **Base URL:** `APP_AUTH_URL` environment variable (default: `http://localhost:8888`)

### Styling Architecture

**Utility-First with Design System Tokens**

1. **Tailwind v4** — Utility classes — (Source: package.json)
2. **CSS Variables** — Theme tokens (enabled via components.json) — (Source: components.json)
3. **Global Styles** — `src/shared/styles/globals.css` — (Source: components.json)
4. **Component Variants** — `class-variance-authority` for systematic variants — (Source: package.json)

**Class name pattern:**
```typescript
const classes = cn(
  "base-classes",           // Base styles
  variants({ variant }),    // CVA variants
  props.class              // Consumer overrides
)
```

(Source: .github/copilot-instructions.md, src/shared/lib/utils.ts)

### Form Handling

**Observed pattern:** Custom form validation without a library.

- `TaskFormFields.vue` — Form fields component
- `src/shared/lib/form-validation.ts` — Validation utilities

**[TODO]** Document form validation rules and error handling patterns.

### Error Handling

**Service-level error handling:**

```typescript
try {
  const response = await apiClient.request(/* ... */);
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks (${response.status})`);
  }
  // ...
} catch (error) {
  console.error("Error fetching tasks:", error);
  throw error;  // Re-throw for component handling
}
```

(Source: src/shared/services/task.service.ts)

**[TODO]** Document component-level error display patterns (no global error boundary observed).

### Internationalization (i18n)

**Hybrid approach:**

1. **Shell provides i18next instance** — (Source: src/shared/types/shell-services.ts)
2. **App registers its namespace** — `taskbolt` with English translations — (Source: src/shared/i18n/translations.ts)
3. **Composable wrapper** — `useTaskboltTranslation()` binds to app namespace — (Source: src/shared/composables/useShellServices.ts)

**Usage in components:**
```typescript
const { t } = useTaskboltTranslation()
// t('taskForm.createTitle') → "Create Task"
```

**[ASK USER]** How are non-English locales managed? Are translations bundled or loaded dynamically?

### Code Splitting Strategy

**Rsbuild performance config:**

```typescript
performance: {
  chunkSplit: {
    strategy: "split-by-experience"
  }
}
```

(Source: rsbuild.config.ts)

**Route-based splitting:** All feature pages use lazy imports:

```typescript
{
  path: '/backlogs',
  component: () => import('@/features/backlogs/BacklogsPage.vue')
}
```

(Source: src/router/index.ts)

### Build & Deployment

**Development:**
- Port 2001, CORS enabled, source maps
- Command: `pnpm dev` → `rsbuild dev`

**Production:**
- Output: `dist/` directory
- Entry: `dist/remoteEntry.js` (Module Federation manifest)
- Asset prefix: `auto` (dynamic public path)
- Command: `pnpm build` → `rsbuild build`

(Source: rsbuild.config.ts, package.json)

**[ASK USER]** What is the deployment target? CDN? Container? Static hosting?

## Design Principles

Based on `.github/copilot-instructions.md`:

1. **Shell-dependent architecture** — No standalone mode in production
2. **Service injection** — Core capabilities come from shell (auth, i18n, toast)
3. **Feature isolation** — Each feature is a self-contained module
4. **Composition over inheritance** — Components compose primitives with utility functions
5. **Type safety** — Strict TypeScript with explicit interfaces for shell contracts

## Constraints

1. **Must use shell services** — Cannot work without `window.__SHELL_SERVICES__` — (Source: .github/copilot-instructions.md)
2. **Router must use named routes** — Path-based navigation prohibited — (Source: .github/copilot-instructions.md)
3. **i18n namespace locked** — All text must use `taskbolt` namespace — (Source: .github/copilot-instructions.md)
