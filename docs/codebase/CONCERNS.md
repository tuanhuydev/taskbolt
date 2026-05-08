# Technical Concerns & Risks

**Evidence-Based Analysis** — All claims cite source files or observations.

## Critical Concerns

### 1. Zero Test Coverage ⚠️ **CRITICAL**

**Problem:** No testing framework installed. No tests exist.

**Impact:**
- Cannot detect regressions
- High risk when refactoring
- No behavior documentation
- Difficult to onboard new developers

**Evidence:** No test files, no test dependencies in package.json — (Source: package.json, workspace scan)

**Recommendation:** Implement Vitest + @vue/test-utils immediately. See [TESTING.md](TESTING.md) for roadmap.

**Priority:** 🔴 **URGENT**

---

### 2. No Linting or Code Formatting ⚠️ **HIGH**

**Problem:** No ESLint, Prettier, or code quality tooling detected.

**Impact:**
- Inconsistent code style across team
- Potential bugs (unused vars, missing awaits, etc.)
- Hard to enforce conventions
- No automated best practices

**Evidence:** No `.eslintrc`, `.prettierrc`, or linting scripts in package.json — (Source: project root, package.json)

**Recommendation:**
```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
pnpm add -D eslint-plugin-vue prettier eslint-config-prettier
```

**Priority:** 🔴 **HIGH**

---

### 3. No Error Boundary / Global Error Handling ⚠️ **HIGH**

**Problem:** No global error boundary or unhandled error catcher observed.

**Impact:**
- Uncaught errors crash the entire app
- Poor user experience on failures
- No error reporting to shell or monitoring service

**Evidence:** No error boundary component, no `app.config.errorHandler` — (Source: src/bootstrap.ts, src/main.ts)

**Recommendation:** Add Vue error boundary and report to shell's ToastService:

```typescript
app.config.errorHandler = (err, instance, info) => {
  console.error('[Taskbolt Error]', err, info)
  
  const toast = getToastService()
  toast?.error('An unexpected error occurred')
  
  // Optional: report to monitoring service
}
```

**Priority:** 🟡 **MEDIUM-HIGH**

---

### 4. No State Management for Cross-Feature Data ⚠️ **MEDIUM**

**Problem:** No Pinia, Vuex, or centralized state store detected.

**Impact:**
- Difficult to share data between features
- Risk of prop drilling
- Duplication of API calls
- Cache management challenges

**Evidence:** No state management library in package.json — (Source: package.json)

**Current approach:** Component-local state + composables

**Recommendation:** Evaluate need for Pinia if cross-feature state becomes complex.

**Priority:** 🟢 **LOW** (acceptable for current scope, monitor as app grows)

---

### 5. Shell Service Availability Not Validated on Mount ⚠️ **MEDIUM**

**Problem:** App doesn't verify shell services exist before rendering.

**Current behavior:**
```typescript
if (!registry) {
  console.warn("Shell services are not available")
}
// ...but app continues anyway
```

(Source: src/shared/composables/useShellServices.ts)

**Impact:**
- Runtime errors when services are accessed
- Poor error messages for users
- Hard to debug integration issues

**Recommendation:** Add service validation in bootstrap:

```typescript
export function mount(el: string | HTMLElement) {
  const registry = getShellServiceRegistry()
  
  if (!registry || !registry.has('ApiClient')) {
    throw new Error('[Taskbolt] Required shell services not available')
  }
  
  // ...mount
}
```

**Priority:** 🟡 **MEDIUM**

---

## Security Concerns

### 6. Overly Permissive CORS in Development ⚠️ **MEDIUM**

**Configuration:**
```typescript
headers: {
  "Access-Control-Allow-Origin": "*"
}
```

(Source: rsbuild.config.ts)

**Impact:**
- Any site can access dev server
- Risk of CSRF in development
- Doesn't match production behavior

**Recommendation:** Restrict to specific origins:
```typescript
"Access-Control-Allow-Origin": "http://localhost:3000" // Shell's port
```

**Priority:** 🟢 **LOW** (dev-only concern)

---

### 7. No CSRF Protection Visible ⚠️ **UNKNOWN**

**Problem:** No CSRF token handling observed in API calls.

**Evidence:** Services use `apiClient.request()` without visible token headers — (Source: src/shared/services/task.service.ts)

**Questions:**
- Does shell's ApiClient handle CSRF tokens?
- Is API stateless (JWT-only)?
- Are mutations protected at API layer?

**Recommendation:** [ASK USER] Document CSRF strategy or implement if missing.

**Priority:** 🟡 **MEDIUM** (depends on shell implementation)

---

### 8. Environment Variables Not Validated ⚠️ **LOW**

**Problem:** `APP_AUTH_URL` falls back to localhost if missing.

```typescript
process.env.APP_AUTH_URL || "http://localhost:8888"
```

(Source: rsbuild.config.ts)

**Impact:**
- Production might silently fail with wrong URL
- No build-time validation of required env vars

**Recommendation:** Add env validation:

```typescript
if (!process.env.APP_AUTH_URL && process.env.NODE_ENV === 'production') {
  throw new Error('APP_AUTH_URL is required in production')
}
```

**Priority:** 🟢 **LOW**

---

## Maintainability Concerns

### 9. No API Contract Validation (TypeScript Only) ⚠️ **MEDIUM**

**Problem:** API responses are typed but not validated at runtime.

```typescript
const { tasks }: TaskResponse = await response.json()
// No validation that response actually matches TaskResponse
```

(Source: src/shared/services/task.service.ts)

**Impact:**
- Runtime errors if API changes
- TypeScript types can drift from reality
- Silent data corruption

**Recommendation:** Add runtime validation (Zod, Yup, or manual):

```typescript
import { z } from 'zod'

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  // ...
})

const data = await response.json()
const validated = TaskSchema.parse(data.tasks)
```

**Priority:** 🟡 **MEDIUM**

---

### 10. Magic Strings for Service Names ⚠️ **LOW**

**Problem:** Service names are hardcoded strings with no constants.

```typescript
const possibleNames = ["ToastService", "toastService", "toast"]
```

(Source: src/shared/composables/useShellServices.ts)

**Impact:**
- Typos not caught at compile time
- Hard to refactor service names
- Unclear what names are canonical

**Recommendation:** Define constants:

```typescript
export const SERVICE_NAMES = {
  TOAST: ['ToastService', 'toastService', 'toast'],
  API_CLIENT: ['ApiClient', 'apiClient'],
  I18N: ['i18n', 'i18nService']
} as const
```

**Priority:** 🟢 **LOW**

---

### 11. No Dependency Injection Testing Strategy ⚠️ **MEDIUM**

**Problem:** Shell services are injected via global window object.

**Impact:**
- Hard to mock in tests
- Components tightly coupled to global state
- Can't easily test with different service implementations

**Current approach:** Injection key for testing, but not documented:

```typescript
const injectedServices = inject(SHELL_SERVICES_KEY, null)
```

(Source: src/shared/composables/useShellServices.ts)

**Recommendation:** Document testing pattern in [TESTING.md](TESTING.md) and provide test utilities.

**Priority:** 🟡 **MEDIUM** (blocks testing effort)

---

## Performance Concerns

### 12. No Route-Level Code Splitting Optimization ⚠️ **LOW**

**Current:** All routes use dynamic imports (good).

```typescript
component: () => import('@/features/backlogs/BacklogsPage.vue')
```

(Source: src/router/index.ts)

**Potential improvement:** Prefetch likely next routes:

```typescript
{
  path: '/backlogs',
  component: () => import('@/features/backlogs/BacklogsPage.vue')
}
```

**Priority:** 🟢 **LOW** (optimization, not concern)

---

### 13. Eager Loading of Vue Singleton ⚠️ **LOW**

**Configuration:**
```typescript
shared: {
  vue: { singleton: true, eager: true }
}
```

(Source: rsbuild.config.ts)

**Impact:** Vue is loaded immediately instead of lazily.

**Trade-off:**
- ✅ Faster initial render (Vue already loaded)
- ❌ Larger initial bundle

**Recommendation:** Profile load time. If shell already loads Vue, `eager: true` is optimal.

**Priority:** 🟢 **LOW** (likely correct choice)

---

## Documentation Concerns

### 14. No Component Documentation ⚠️ **LOW**

**Problem:** UI components lack usage examples or Storybook.

**Impact:**
- Hard to discover components
- Unclear how to use variants
- No visual regression testing baseline

**Recommendation:** Add Storybook or Histoire:

```bash
pnpm add -D @histoire/plugin-vue histoire
```

**Priority:** 🟢 **LOW** (nice-to-have)

---

### 15. Incomplete Type Documentation ⚠️ **LOW**

**Problem:** Some interfaces lack JSDoc comments.

**Example:**
```typescript
export interface Task {
  id: string;        // What format? UUID?
  title: string;     // Max length?
  storyPoint?: number; // Range? Can be 0?
}
```

(Source: src/shared/types/task.ts)

**Recommendation:** Add JSDoc with constraints:

```typescript
export interface Task {
  /** UUID v4 identifier */
  id: string;
  
  /** Task title (1-200 characters) */
  title: string;
  
  /** Story points (0-100, Fibonacci scale recommended) */
  storyPoint?: number;
}
```

**Priority:** 🟢 **LOW**

---

## Deployment Concerns

### 16. No CI/CD Pipeline ⚠️ **MEDIUM**

**Problem:** No GitHub Actions or CI config detected.

**Impact:**
- Manual deployments (error-prone)
- No automated quality checks
- Can't enforce test coverage
- Slow feedback loop

**Evidence:** No `.github/workflows/` directory — (Source: project scan)

**Recommendation:** Implement GitHub Actions for:
- Linting and type checking
- Testing
- Build verification
- Automated deployment

**Priority:** 🟡 **MEDIUM**

---

### 17. No Build Artifact Optimization Verification ⚠️ **LOW**

**Problem:** No bundle size tracking or optimization checks.

**Recommendation:** Add bundle analysis:

```bash
pnpm add -D rollup-plugin-visualizer
```

Monitor for:
- Bundle size < 500KB (gzipped)
- No duplicate dependencies
- Proper tree shaking

**Priority:** 🟢 **LOW** (optimization, not blocker)

---

## Divergence from Modern Best Practices

### 18. No Git Hooks for Quality Gates ⚠️ **LOW**

**Missing:** husky, lint-staged for pre-commit checks

**Recommendation:**
```bash
pnpm add -D husky lint-staged
```

```json
{
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix", "prettier --write"]
  }
}
```

**Priority:** 🟢 **LOW**

---

## Questions for User (Summary)

All `[ASK USER]` items from documentation files:

1. **STACK.md:**
   - Minimum Node.js version requirement?
   
2. **ARCHITECTURE.md:**
   - How does React shell discover and load this remote?
   - What other services does shell provide?
   - How does shell handle navigation between remotes?
   
3. **INTEGRATIONS.md:**
   - Shell application repository URL and name?
   - What locales does shell support?
   - Production API URL?
   - Token format (JWT/OAuth)? How is refresh handled?
   - Production CORS settings?
   - Is taskbolt part of a larger monorepo?
   - How are API requests secured (rate limiting, validation)?
   
4. **TESTING.md:**
   - Does shell have test/staging environment for testing remotes?
   
5. **CONCERNS.md:**
   - Document CSRF strategy
   - Deployment target (CDN/container/static)?

## Risk Summary

| Severity | Count | Top Issue |
|----------|-------|-----------|
| 🔴 CRITICAL | 1 | No testing framework |
| 🔴 HIGH | 2 | No linting, no error boundary |
| 🟡 MEDIUM | 7 | No CI/CD, service validation, etc. |
| 🟢 LOW | 8 | Documentation, optimizations |

**Overall Risk Level:** 🟡 **MEDIUM-HIGH**

Most concerns are addressable with standard tooling. Critical path: Testing → Linting → CI/CD.
