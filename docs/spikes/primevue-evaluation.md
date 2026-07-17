# Spike: PrimeVue integration evaluation

**Branch:** `spike/primevue-evaluation`
**Prototype:** `src/features/spike-primevue/PrimeVueSpikePage.vue` — not linked from any nav, route `/spike/primevue`, exists only to exercise the library.

## What was built

- Installed `primevue` (v5) + `@primeuix/themes` (the current, maintained theming package — `@primevue/themes` shows a deprecation warning on install and points here instead).
- One `DataTable` + `Column` prototype with sortable columns and built-in pagination, rendering sample task-shaped rows.
- A custom theme preset (`spike-primevue/theme.ts`) built with `definePreset(Aura, ...)`, attempting to line the primary color up with the app's existing `globals.css` tokens (`--primary: 204 38% 15%`).
- Registered scoped to Taskbolt's own Vue app instance only (in `App.vue`'s existing "install once" guard, alongside router/pinia) — does not touch the shell or any other remote.

## Findings

### 1. Licensing — the biggest surprise, and a blocker to resolve before going further

As of the current PrimeVue/`@primeuix/themes` versions, the console immediately shows:

```
[PrimeUI] PrimeUI license is not configured.
```

...and a floating **"Invalid PrimeUI License"** badge renders in the corner of the page. This is new: PrimeTek now gates PrimeVue usage behind a "PrimeUI" license key — `app.use(PrimeVue, { license: 'PRIMEUI-LICENSE-KEY' })` — with a free community tier and a paid commercial tier ([primeui.dev/licenses/commercial](https://primeui.dev/licenses/commercial), [primevue.dev/configuration](https://primevue.dev/configuration)). Older PrimeVue major versions (v3/v4) did not require this.

**This needs to be resolved before any further investment**: confirm what the free community tier actually covers, whether the nag badge is dev-only or would also appear in production without a registered key, and whether registering a license is acceptable from a legal/procurement standpoint. I did not chase this further in the time-box — flagging it as the first thing to close out if this direction is pursued.

### 2. Bundle size — significant, from minimal usage

Production build, before vs. after adding PrimeVue and using exactly one `DataTable`:

| | Before | After | Delta |
|---|---|---|---|
| Raw | 1102.5 kB | 1765.9 kB | **+663.4 kB (+60%)** |
| Gzip | 325.0 kB | 459.0 kB | **+134.0 kB (+41%)** |

Nearly all of the increase landed in a single ~1.07 MB (254 kB gzip) chunk — using one component pulled in far more than expected, suggesting the default import path doesn't tree-shake cleanly without more deliberate per-component/style configuration than was tried here. This is a real cost for a task-tracking app that's currently lean.

### 3. Visual integration — works, but full parity is more than a theme preset

The DataTable rendered correctly with working sort and pagination out of the box — the component quality itself is solid. But even after a custom `definePreset` pass at matching the app's primary color, PrimeVue's typography, spacing, and control chrome (pagination buttons, sort icons) still read as visually distinct from the existing shadcn-style system. Getting to true parity would mean either extensive preset customization or `unstyled` + passthrough mode — at which point a meaningful share of the "we get pre-built UI for free" value proposition is spent rebuilding the same styling work the current reka-ui + Tailwind setup already does.

### 4. Unrelated bug noticed along the way

Testing the prototype via the standalone dev entry (`main.ts`, not through the shell) showed every sidebar label as a raw, untranslated i18n key (`sidebar.home`, `sidebar.backlogs`, etc.) instead of real text. This is pre-existing and unrelated to PrimeVue — i18n isn't initialized in standalone dev mode. Not fixed here (out of scope for this spike); worth its own ticket if standalone dev mode is something the team relies on.

## Recommendation

Confirms the starting hypothesis from the task description: **don't do a full migration.** The license requirement and bundle-size cost are real, unforced costs that a wholesale swap would take on for the entire app, and the visual-parity gap means the "faster to build UI" pitch is weaker than it looks once you actually try to match the existing design language.

**Targeted adoption remains worth considering, but the license question has to be answered first** — specifically for a genuinely hard-to-hand-build widget like the planned Kanban board, where the value of pre-built drag/column/virtualization logic is highest and the bundle-size cost of one feature-scoped chunk is more justifiable than paying it app-wide. Recommend closing out the licensing question with PrimeTek/legal before writing any implementation ticket that adopts PrimeVue for that or any other feature.

## Cleanup

This branch adds `primevue` and `@primeuix/themes` as dependencies and one unreachable prototype route. If the recommendation above is accepted (no immediate adoption), these should be reverted rather than merged as-is — kept here on the branch for review/discussion, not intended to land on `main` as is.
