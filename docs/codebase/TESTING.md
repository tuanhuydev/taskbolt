# Testing Setup

**Evidence-Based Analysis** — All claims cite source files.

## Current State: No Testing Framework

**Critical Finding:** No testing framework is currently installed or configured.

### Analysis

**Search for test-related files:**

```bash
# No matches found for:
- *.test.ts
- *.spec.ts
- *.test.vue
- *.spec.vue
- __tests__/ directories
```

(Source: workspace file search)

**Search for test dependencies:**

```json
{
  "dependencies": {},     // No test libraries
  "devDependencies": {}   // No Vitest, Jest, Cypress, Playwright, etc.
}
```

(Source: package.json)

**Search for test scripts:**

```json
{
  "scripts": {
    "dev": "rsbuild dev",
    "build": "rsbuild build",
    "preview": "rsbuild preview"
    // No "test" or "test:*" scripts
  }
}
```

(Source: package.json)

**Configuration files checked:**

- ❌ No `vitest.config.ts`
- ❌ No `jest.config.js`
- ❌ No `cypress.config.ts`
- ❌ No `playwright.config.ts`

## Testing Gaps

### 1. Unit Testing

**Missing:**
- Component unit tests (Vue Test Utils + Vitest/Jest)
- Composable tests (e.g., `useShellServices()`)
- Service function tests (e.g., `getTasks()`)
- Utility function tests (e.g., `cn()`)

**High-value test targets:**

```typescript
// Utilities
src/shared/lib/utils.ts          // Pure functions (easy to test)
src/shared/lib/form-validation.ts

// Composables
src/shared/composables/useShellServices.ts  // Complex logic, mocking needed

// Services
src/shared/services/task.service.ts         // API interactions
src/shared/services/project.service.ts
```

### 2. Component Testing

**Missing:**
- Component behavior tests
- Props/emits validation
- Slot rendering tests
- Accessibility tests

**High-value component test targets:**

```vue
src/shared/components/ui/button/Button.vue      // Variant combinations
src/features/backlogs/TaskForm.vue              // Form validation
src/features/backlogs/TaskFormFields.vue        // Field interactions
src/shared/components/ui/task-item/TaskItem.vue // Display logic
```

### 3. Integration Testing

**Missing:**
- Feature workflow tests (e.g., create → edit → delete task)
- Router navigation tests
- Shell service integration tests

### 4. End-to-End Testing

**Missing:**
- User journey tests
- Cross-browser testing
- Shell integration tests (loading as Module Federation remote)

### 5. Type Testing

**Partial coverage:**
- TypeScript strict mode enabled — (Source: tsconfig.json)
- Type checking during build

**Missing:**
- Type-level tests (e.g., conditional types, utility types)

## Recommended Testing Stack

Based on project stack (Vue 3 + TypeScript + Rsbuild):

### Unit & Component Testing

**Vitest** — Fast, Vite-native test runner

```bash
pnpm add -D vitest @vitest/ui
pnpm add -D @vue/test-utils happy-dom
```

**Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### E2E Testing

**Playwright** — Modern, multi-browser E2E framework

```bash
pnpm add -D @playwright/test
```

**Why not Cypress?** Playwright has better Module Federation support.

### Accessibility Testing

**@axe-core/playwright** — Automated a11y checks

```bash
pnpm add -D @axe-core/playwright
```

### Visual Regression Testing

**Playwright Screenshots** — Built-in screenshot comparison

```typescript
await expect(page).toHaveScreenshot('task-form.png')
```

## Testing Challenges for This Project

### 1. Shell Service Dependencies

**Problem:** Components require `window.__SHELL_SERVICES__` to function.

**Solution:** Mock the service registry in tests:

```typescript
// tests/mocks/shell-services.ts
import { vi } from 'vitest'

export const mockShellServices = {
  get: vi.fn((name: string) => {
    if (name === 'ApiClient') return mockApiClient
    if (name === 'ToastService') return mockToastService
    return null
  }),
  has: vi.fn(() => true),
  list: vi.fn(() => ['ApiClient', 'ToastService', 'i18n']),
  getMetadata: vi.fn(() => null),
  getRegistryInfo: vi.fn(() => ({
    version: '1.0.0',
    availableServices: ['ApiClient', 'ToastService', 'i18n']
  }))
}

// Setup
beforeEach(() => {
  window.__SHELL_SERVICES__ = mockShellServices
})

afterEach(() => {
  delete window.__SHELL_SERVICES__
})
```

### 2. Module Federation Testing

**Problem:** Hard to test as a federated remote in isolation.

**Solution:**
- Unit/component tests: Mock federation (use standalone mode)
- E2E tests: Test with actual shell (require shell dev environment)

**[ASK USER]** Does the shell have a test/staging environment for testing remotes?

### 3. i18n Testing

**Problem:** Translations depend on shell's i18next instance.

**Solution:** Mock i18next in tests:

```typescript
import { vi } from 'vitest'

const mockI18n = {
  t: vi.fn((key: string) => key), // Return key for testing
  addResourceBundle: vi.fn(),
  hasResourceBundle: vi.fn(() => false)
}
```

### 4. Router Testing

**Problem:** Components use Vue Router with dynamic base path.

**Solution:** Use `@vue/test-utils` with mock router:

```typescript
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [/* test routes */]
})

mount(Component, {
  global: {
    plugins: [router]
  }
})
```

## Test Coverage Goals

**Recommended targets:**

- **Utilities:** 100% (pure functions, easy to test)
- **Services:** 90%+ (critical API logic)
- **Composables:** 85%+ (complex but mockable)
- **Components:** 70%+ (UI logic)
- **Overall:** 80%+

## CI/CD Integration

**[TODO]** No CI/CD configuration detected.

**Recommended:**

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e
```

## Next Steps

### Phase 1: Foundation (Week 1)

1. Install Vitest + @vue/test-utils
2. Create test setup file with shell service mocks
3. Add test scripts to package.json:
   ```json
   {
     "test": "vitest",
     "test:ui": "vitest --ui",
     "test:coverage": "vitest --coverage"
   }
   ```

### Phase 2: Critical Path (Week 2-3)

1. Test utilities (`cn()`, form validation)
2. Test shell service composable
3. Test task service functions
4. Add component tests for Button, TaskItem

### Phase 3: Feature Testing (Week 4-6)

1. Test TaskForm workflow
2. Test BacklogsPage interactions
3. Add router navigation tests
4. Implement accessibility tests

### Phase 4: E2E & CI (Week 7-8)

1. Set up Playwright
2. Write critical user journey tests
3. Configure GitHub Actions
4. Add coverage reporting

## Documentation Gaps

**[TODO]** Create:
- `tests/README.md` — Testing guide for contributors
- `tests/mocks/README.md` — Mock usage documentation
- Component test examples as templates

## Risk Assessment

**Current Risk:** **HIGH**

Without tests:
- ❌ No regression detection
- ❌ No refactoring confidence
- ❌ No documentation of expected behavior
- ❌ High bug introduction risk
- ❌ Difficult onboarding for new developers

**Recommended Priority:** Implement testing framework immediately.
