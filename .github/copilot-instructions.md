---
description: Vue MF remote with shell services
---

## 📚 Knowledge Base Integration (Required)
This project maintains its verifiable architectural truth in the `docs/codebase/` directory. Depending on the task, you MUST silently read the relevant context before generating code:
- **New Feature / Refactoring:** Read `docs/codebase/STRUCTURE.md` and `docs/codebase/ARCHITECTURE.md` to ensure correct placement and data flow.
- **Component / Logic Implementation:** Read `docs/codebase/CONVENTIONS.md` to match existing naming, error handling, and formatting rules.
- **Adding External Services / APIs:** Read `docs/codebase/INTEGRATIONS.md`.
- **Writing Tests:** Read `docs/codebase/TESTING.md` for mocking strategies and file placement.
- **Debugging / Complex Refactors:** Read `docs/codebase/CONCERNS.md` to avoid known tech debt and fragile areas.

## 🛠️ Stack
Vue 3.5 Composition API (`<script setup lang="ts">`), Rsbuild, Module Federation, Tailwind v4

## 🚨 Critical Rules
1. **Shell services required** — Access via `useShellServices()` composable, no standalone mode.
2. **Router navigation** — Use `router.push({ name: 'route-name' })`, never absolute paths.
3. **i18n** — Use `useTaskboltTranslation()` for all text, namespace: `taskbolt`.
4. **Component pattern** — Accept `class` prop, merge with `cn(baseClasses, props.class)`.
5. **Props forwarding** — Use `useForwardProps()` from reka-ui for headless UI wrappers.

## 📂 File Organization
- Features: `/src/features/{feature-name}/`
- Shared UI: `/src/shared/components/ui/{component-name}/`
- Types: `/src/shared/types/`