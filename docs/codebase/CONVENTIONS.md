# Code Conventions

**Evidence-Based Analysis** — All claims cite source files.

## Vue Component Conventions

### Script Setup Syntax (Mandatory)

All Vue components use Composition API with `<script setup lang="ts">`:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ /* ... */ }>()
const emit = defineEmits<{ /* ... */ }>()
</script>
```

(Source: .github/copilot-instructions.md, src/features/backlogs/TaskForm.vue)

**Prohibited:** Options API (`export default { data() {} }`), `<script>` without `setup`.

### Component Naming

- **File names:** PascalCase with `.vue` extension
  - Examples: `TaskForm.vue`, `BacklogsPage.vue`, `DrawerContent.vue`
- **Page components:** Suffix with `Page` (e.g., `ActiveSprintPage.vue`)
- **Sub-components:** Descriptive names without suffixes (e.g., `TaskFormFields.vue`)

(Source: src/features/, src/shared/components/)

### Props & Emits

**Props with TypeScript:**

```typescript
const props = defineProps<{
  open: boolean
  initialData?: Partial<Task>
}>()
```

**Emits with type safety:**

```typescript
const emit = defineEmits<{
  submit: [data: any, isEdit: boolean]
  close: []
}>()
```

(Source: src/features/backlogs/TaskForm.vue)

### Class Prop Pattern (Mandatory for Shared UI)

All shared UI components must:

1. Accept a `class` prop
2. Merge with base classes using `cn()` utility

```typescript
interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]  // ← Accept class prop
}

const props = withDefaults(defineProps<Props>(), { /* ... */ })
```

```vue
<Primitive
  :class="cn(buttonVariants({ variant, size }), props.class)"
>
  <!-- Merge base + consumer classes -->
```

(Source: .github/copilot-instructions.md, src/shared/components/ui/button/Button.vue)

### Composable Usage

**Pattern:** Import and destructure in setup:

```typescript
import { useTaskboltTranslation } from '@/shared/composables/useShellServices'

const { t } = useTaskboltTranslation()
```

(Source: src/features/backlogs/TaskForm.vue)

## TypeScript Conventions

### Strict Mode Enabled

```json
{
  "strict": true,
  "forceConsistentCasingInFileNames": true
}
```

(Source: tsconfig.json)

### Type Definitions

- **Interfaces over types** for object shapes (observed pattern)
- **Enums for constants:**

```typescript
export enum TaskType {
  STORY = "STORY",
  EPIC = "EPIC",
  ISSUE = "ISSUE",
  BUG = "BUG",
}
```

(Source: src/shared/types/task.ts)

### Import Aliases

Always use `@/` alias for src imports:

```typescript
import { Task } from "@/shared/types/task"
import { useShellServices } from "@/shared/composables/useShellServices"
```

(Source: tsconfig.json, observed across all files)

### Null Safety

Explicit null checks for shell services:

```typescript
export function useShellServices() {
  const registry = injectedServices || getShellServiceRegistry();

  if (!registry) {
    console.warn("Shell services are not available");
  }

  return { registry, /* ... */ }
}
```

(Source: src/shared/composables/useShellServices.ts)

## Styling Conventions

### Tailwind Utility Classes

**Primary approach:** Utility classes directly in templates

```vue
<DrawerContent class="w-[600px]">
```

(Source: src/features/backlogs/TaskForm.vue)

### Class Name Utility

Use `cn()` helper to merge class names:

```typescript
import { cn } from "@/shared/lib/utils"

const classes = cn(
  "base-class",
  conditionalClass && "conditional-class",
  props.class
)
```

(Source: src/shared/lib/utils.ts, src/shared/components/ui/button/Button.vue)

**Implementation:**

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- `clsx` — Conditional class composition
- `twMerge` — Tailwind class deduplication/overrides

### Variants with CVA

Use `class-variance-authority` for systematic component variants:

```typescript
import { cva, type VariantProps } from "class-variance-authority"

export const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      outline: "border border-input bg-background",
      // ...
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      // ...
    }
  },
  defaultVariants: { variant: "default", size: "default" }
})

export type ButtonVariants = VariantProps<typeof buttonVariants>
```

(Source: package.json, src/shared/components/ui/button/Button.vue)

## File Organization Conventions

### Barrel Exports

Each UI component directory has an `index.ts`:

```typescript
// src/shared/components/ui/button/index.ts
export { default as Button } from './Button.vue'
export { buttonVariants } from './variants'
export type { ButtonVariants } from './variants'
```

(Source: src/shared/components/ui/button/index.ts pattern)

**Import from barrel:**

```typescript
import { Button } from '@/shared/components/ui/button'
```

### Feature Structure

```
features/{feature-name}/
├── {Feature}Page.vue        ← Route component
├── {Feature}Component.vue   ← Feature-specific components
├── index.ts                 ← Public exports (optional)
```

(Source: .github/copilot-instructions.md, src/features/)

## Naming Conventions

### Files

| Type | Convention | Examples |
|------|-----------|----------|
| Vue Components | PascalCase | `TaskForm.vue`, `AppSidebar.vue` |
| TypeScript files | camelCase | `task.service.ts`, `useProject.ts` |
| Type files | camelCase | `task.ts`, `shell-services.ts` |
| Config files | kebab-case | `rsbuild.config.ts`, `postcss.config.js` |
| Composables | `use` prefix | `useShellServices.ts`, `useProject.ts` |
| Services | `.service` suffix | `task.service.ts`, `project.service.ts` |

### Variables & Functions

- **camelCase** for variables, functions, methods
- **PascalCase** for classes, components, types, enums
- **SCREAMING_SNAKE_CASE** for true constants

```typescript
const APP_AUTH_URL = process.env.APP_AUTH_URL || "http://localhost:8888"
```

(Source: src/shared/lib/constants.ts)

## Router Conventions

### Named Routes (Mandatory)

Always use named routes for navigation:

```typescript
// Correct
router.push({ name: 'backlogs' })

// Incorrect (PROHIBITED)
router.push('/backlogs')
```

(Source: .github/copilot-instructions.md)

**Rationale:** Base path may change when integrated into shell (`/dashboard/taskbolt`).

### Route Naming

- **kebab-case** for path and name
- **Same name for path and route name** (when possible)

```typescript
{
  path: '/active-sprint',
  name: 'active-sprint',
  component: ActiveSprintPage
}
```

(Source: src/router/index.ts)

## i18n Conventions

### Translation Keys

- **Namespace:** `taskbolt` (mandatory) — (Source: .github/copilot-instructions.md)
- **Key structure:** `{section}.{key}` (dot notation)

```typescript
t('taskForm.createTitle')  // → "Create Task"
t('common.save')           // → "Save"
t('sidebar.backlogs')      // → "Backlogs"
```

(Source: src/shared/i18n/translations.ts)

### Usage

Always use `useTaskboltTranslation()` composable:

```typescript
const { t } = useTaskboltTranslation()
```

**Never access i18next directly** — use the composable wrapper.

(Source: .github/copilot-instructions.md, src/shared/composables/useShellServices.ts)

## Service Conventions

### API Service Pattern

```typescript
export const functionName = async (
  apiClient: ApiClient,
  ...params
) => {
  try {
    const response = await apiClient.request(url, options)
    
    if (!response.ok) {
      throw new Error(`Failed to ... (${response.status})`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error ...", error)
    throw error
  }
}
```

(Source: src/shared/services/task.service.ts)

**Key points:**
- Accept `ApiClient` as first parameter
- Use template literals for error messages with status codes
- Log and re-throw errors
- Return typed data (destructure from JSON when needed)

### Shell Service Access

```typescript
const { registry, getToastService, getApiClient } = useShellServices()

const toastService = getToastService()
if (toastService) {
  toastService.success("Task created!")
}
```

(Source: src/shared/composables/useShellServices.ts)

**Pattern:** Always check for null before using services.

## Comment Conventions

### JSDoc for Public APIs

Functions exported from services/composables have JSDoc:

```typescript
/**
 * Get Toast Service
 */
getToastService(): ToastService | null {
  // ...
}
```

(Source: src/shared/composables/useShellServices.ts)

### Type Comments

Interface fields have inline comments when purpose is non-obvious:

```typescript
export interface RequestOptions extends RequestInit {
  auth?: boolean; // default true — attach Authorization header
}
```

(Source: src/shared/types/shell-services.ts)

## Error Handling Conventions

### Service Layer

- Try-catch blocks around HTTP requests
- Log to console with context
- Re-throw for component handling

### Component Layer

**[TODO]** No consistent error display pattern observed. Document when implemented.

## Git Commit Conventions

**[TODO]** No commit message convention file detected. Document if team follows a standard (Conventional Commits, etc.).

## Linting & Formatting

**[TODO]** No ESLint or Prettier config detected. Document if code style is enforced via tooling.
