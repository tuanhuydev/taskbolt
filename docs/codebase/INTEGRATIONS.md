# External Integrations

**Evidence-Based Analysis** — All claims cite source files.

## Shell Application (Primary Integration)

This Vue app is a **Module Federation remote** consumed by a React shell application.

### Module Federation

**Configuration:**

```typescript
{
  name: "taskbolt",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App.vue"
  },
  shared: {
    vue: {
      singleton: true,
      strictVersion: false,
      requiredVersion: "^3.4.0",
      eager: true
    }
  }
}
```

(Source: rsbuild.config.ts)

**Integration points:**

1. **Shell loads remote:** Accesses `remoteEntry.js` at runtime
2. **Shell calls lifecycle:** `mount(el)` and `unmount()` — (Source: src/bootstrap.ts)
3. **Shell provides services:** Via `window.__SHELL_SERVICES__` — (Source: src/shared/types/root.d.ts)

**[ASK USER]** What is the shell application's repository URL and name?

### Shell Services (Required Dependencies)

The app **cannot function** without these shell-provided services:

#### 1. Service Registry

**Global object:** `window.__SHELL_SERVICES__` of type `ShellServiceRegistry`

```typescript
interface ShellServiceRegistry {
  get<T = any>(name: string): T | null
  has(name: string): boolean
  list(): string[]
  getMetadata(name: string): any | null
  getRegistryInfo(): ShellServiceMetadata
}
```

(Source: src/shared/types/shell-services.ts, src/shared/types/root.d.ts)

#### 2. API Client Service

**Name:** `ApiClient` (or variants checked by composable)

**Interface:**

```typescript
interface ApiClient {
  logout(): void
  getAccessToken(): string | null
  setAccessToken(token: string): void
  isTokenExpired(token: string): boolean
  request(input: RequestInfo | URL, init?: RequestOptions): Promise<Response>
}
```

**Features:**
- Automatic authentication header attachment
- Token management
- HTTP request wrapper

(Source: src/shared/types/shell-services.ts)

**Usage:**

```typescript
const { getApiClient } = useShellServices()
const apiClient = getApiClient()
if (apiClient) {
  await getTasks(apiClient, filters)
}
```

(Source: src/shared/composables/useShellServices.ts, src/shared/services/task.service.ts)

#### 3. Toast Notification Service

**Possible names:** `ToastService`, `toastService`, `toast`

**Interface:**

```typescript
interface ToastService {
  notify: (message: string, severity?: ToastSeverity) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

type ToastSeverity = 'success' | 'error' | 'warning' | 'info'
```

(Source: src/shared/types/shell-services.ts)

**Usage:**

```typescript
const { getToastService } = useShellServices()
const toast = getToastService()
if (toast) {
  toast.success("Task created successfully!")
}
```

(Source: src/shared/composables/useShellServices.ts)

#### 4. i18n Service

**Name:** `i18n` or `i18nService`

**Type:** `i18next` instance

**Integration:**

```typescript
const i18nService = registry.get<I18nService>("i18n")
if (i18nService && !i18nService.hasResourceBundle("en", "taskbolt")) {
  i18nService.addResourceBundle("en", "taskbolt", taskboltTranslations.en)
}
```

(Source: src/shared/composables/useShellServices.ts)

**Translation namespace:** `taskbolt` — All app translations registered under this namespace.

(Source: src/shared/i18n/translations.ts, .github/copilot-instructions.md)

**[ASK USER]** What other locales does the shell support? How are non-English translations managed?

## Backend API

### Base URL Configuration

**Environment variable:** `APP_AUTH_URL`

- **Default:** `http://localhost:8888`
- **Configured via:** Rsbuild define plugin

```typescript
define: {
  "process.env.APP_AUTH_URL": JSON.stringify(
    process.env.APP_AUTH_URL || "http://localhost:8888"
  )
}
```

(Source: rsbuild.config.ts, src/shared/lib/constants.ts)

**[ASK USER]** What is the production API URL? Is it deployed separately from the frontend?

### API Endpoints

Based on service files:

#### Tasks API

**Endpoint:** `GET ${APP_AUTH_URL}/tasks`

**Query parameters:** Arbitrary filter object converted to query string

**Response:**

```typescript
{
  tasks: Array<Task>,
  total: number
}
```

(Source: src/shared/services/task.service.ts)

**[TODO]** Document other endpoints (POST/PUT/DELETE for tasks, projects, etc.).

### Authentication

**Mechanism:** Token-based authentication via `ApiClient.request()`

- Auth header attached automatically by shell's ApiClient
- Token management handled by shell (get/set/expire checks)

(Source: src/shared/types/shell-services.ts)

**[ASK USER]** What token format is used? JWT? OAuth? How is refresh handled?

## Third-Party Services

### UI Component Libraries

**Headless primitives** (no external API calls):

- **Reka UI** — Component primitives — (Source: package.json)
- **Radix Vue** — Accessible components — (Source: package.json)
- **Vaul Vue** — Drawer/sheet components — (Source: package.json)

### Icon Library

**Lucide Vue Next** — Open-source icon set

- **Integration:** Direct Vue components
- **No CDN or API:** Icons bundled at build time

(Source: package.json, components.json)

### Rich Text Editor

**Lexical** — Meta's text editor framework

- **Integration:** Direct JavaScript library
- **No external service**

(Source: package.json)

## Development Integrations

### CORS Configuration

**Development server** allows all origins:

```typescript
headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
}
```

(Source: rsbuild.config.ts)

**[ASK USER]** What are the production CORS settings? Are they handled by the shell or CDN?

### Package Management

**pnpm Workspace** — Monorepo setup

- **Lock file:** `pnpm-lock.yaml`
- **Workspace config:** `pnpm-workspace.yaml`
- **Enforced version:** `10.33.2` via `packageManager` field

(Source: package.json, pnpm-workspace.yaml)

**[ASK USER]** Are there other packages in this workspace? Is taskbolt part of a larger monorepo?

## Browser APIs

### Web History API

Used by Vue Router for client-side navigation:

```typescript
createRouter({
  history: createWebHistory(base),
  routes
})
```

(Source: src/router/index.ts)

### Window Global

**Custom property:** `window.__SHELL_SERVICES__`

```typescript
declare global {
  interface Window {
    __SHELL_SERVICES__: ShellServiceRegistry
  }
}
```

(Source: src/shared/types/root.d.ts)

## No Direct External Integrations Detected

**Analysis of codebase shows:**

- ❌ No analytics services (Google Analytics, Mixpanel, etc.)
- ❌ No error tracking (Sentry, Rollbar, etc.)
- ❌ No feature flags
- ❌ No CDN references for assets
- ❌ No WebSocket connections
- ❌ No OAuth providers (handled by shell)
- ❌ No payment processors
- ❌ No third-party APIs (maps, social, etc.)

**All external concerns delegated to shell application.**

## Integration Health Checks

**[TODO]** No health check or service availability monitoring detected. Consider adding:

- Service registry validation on mount
- Fallback UI when shell services unavailable
- Development mode detection and warnings

## Security Considerations

**Authentication:** Fully delegated to shell's `ApiClient` — (Source: src/shared/types/shell-services.ts)

**[CONCERN]** No visible CSRF protection or request signing. Verify shell implementation.

**[ASK USER]** How are API requests secured in production? Is there rate limiting or request validation?
