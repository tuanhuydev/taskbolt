# Technology Stack

**Evidence-Based Analysis** — All claims cite source files.

## Core Framework

- **Vue 3.4.0** — Composition API with `<script setup lang="ts">` syntax — (Source: package.json, .github/copilot-instructions.md)
- **TypeScript 5.4.0** — Strict mode enabled — (Source: package.json, tsconfig.json)
- **Target:** ES2022 with DOM APIs — (Source: tsconfig.json)

## Build System

- **Rsbuild 1.1.22** — Primary build tool — (Source: package.json, rsbuild.config.ts)
- **Module Federation 2.3.1** (`@module-federation/rsbuild-plugin`) — Exposes this app as a federated remote — (Source: package.json, rsbuild.config.ts)
  - Remote name: `taskbolt`
  - Exposes: `./App` → `./src/App.vue`
  - Shared: Vue singleton with `^3.4.0` (eager loading)
  - Server port: 2001
- **Rspack** — Underlying bundler (via Rsbuild) — (Source: rsbuild.config.ts)

## Styling

- **Tailwind CSS 4.2.2** — Utility-first CSS framework — (Source: package.json)
- **@tailwindcss/postcss 4.2.2** — PostCSS integration — (Source: package.json, postcss.config.js)
- **Autoprefixer 10.4.27** — Vendor prefix automation — (Source: package.json, postcss.config.js)
- **Sass 1.69.5** — CSS preprocessor — (Source: package.json)
- **CSS Variables:** Enabled via Tailwind config — (Source: components.json)

## UI Component Libraries

- **Reka UI 2.9.3** — Headless UI primitives (base for custom components) — (Source: package.json, src/shared/components/ui/button/Button.vue)
- **Radix Vue 1.9.17** — Unstyled, accessible components — (Source: package.json)
- **Vaul Vue 0.4.1** — Drawer component library — (Source: package.json)
- **Lucide Vue Next 1.0.0** — Icon library — (Source: package.json, components.json)
- **shadcn-vue** component pattern — New York style, neutral base color — (Source: components.json)

## State & Utilities

- **@vueuse/core 14.2.1** — Vue composition utilities — (Source: package.json)
- **class-variance-authority 0.7.1** — Variant-based styling — (Source: package.json)
- **clsx 2.1.1** + **tailwind-merge 3.5.0** — Class name utilities (via `cn()` helper) — (Source: package.json, src/shared/lib/utils.ts)
- **tw-animate-css 1.4.0** — Tailwind animation utilities — (Source: package.json)

## Routing

- **Vue Router 4.2.5** — Client-side routing with Web History mode — (Source: package.json, src/router/index.ts)
- **Base path:** Configurable (defaults to `/`, production uses `/dashboard/taskbolt`) — (Source: src/bootstrap.ts)
- **History API Fallback:** Enabled for deep linking — (Source: rsbuild.config.ts)

## Rich Text Editing

- **Lexical 0.17.1** — Facebook's extensible text editor framework — (Source: package.json)
- **@lexical/link 0.17.1** — Link support — (Source: package.json)
- **@lexical/list 0.17.1** — List formatting — (Source: package.json)
- **@lexical/markdown 0.17.1** — Markdown parsing/serialization — (Source: package.json)
- **@lexical/rich-text 0.17.1** — Rich text editing capabilities — (Source: package.json)

## Internationalization

- **i18next 26.0.3** (dev dependency) — Types for shell-provided i18n service — (Source: package.json)
- **Custom translations** — `taskbolt` namespace with English locale — (Source: src/shared/i18n/translations.ts)
- **Integration:** Uses shell's i18next instance via `useTaskboltTranslation()` composable — (Source: src/shared/composables/useShellServices.ts)

## Package Management

- **pnpm 10.33.2** — Enforced via `packageManager` field — (Source: package.json)
- **Workspace:** Configured via `pnpm-workspace.yaml` — (Source: project root)

## Environment & Configuration

- **Node.js:** Required for build (version TBD) — [ASK USER: Minimum Node.js version requirement]
- **Environment Variables:**
  - `APP_AUTH_URL` — Backend API base URL (default: `http://localhost:8888`) — (Source: rsbuild.config.ts, src/shared/lib/constants.ts)

## Development Server

- **Port:** 2001 — (Source: rsbuild.config.ts)
- **CORS:** Fully permissive for development (`Access-Control-Allow-Origin: *`) — (Source: rsbuild.config.ts)
- **Asset Prefix:** `auto` — Dynamic public path resolution — (Source: rsbuild.config.ts)
- **Source Maps:** `source-map` for JavaScript — (Source: rsbuild.config.ts)

## Testing

**[CONCERN]** No testing framework detected. No test files found in codebase.

## Type Definitions

Custom type definition files:
- `env.d.ts` — Environment type declarations
- `shims-vue.d.ts` — Vue SFC type support
- `shims-css.d.ts` — CSS module type support
- `root.d.ts` — Global type extensions

## External Dependencies (Shell Services)

This is a **Module Federation remote** that depends on a React shell application for:
- Authentication & API client
- Toast notifications
- i18n service instance
- [TODO: Complete list of shell-provided services]

(Source: src/shared/types/shell-services.ts, .github/copilot-instructions.md)
