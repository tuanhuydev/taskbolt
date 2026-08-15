import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

// Rough attempt to line PrimeVue's tokens up with globals.css's shadcn-style
// palette (primary ≈ hsl(204 38% 15%), radius 0.5rem) — not a full match,
// see docs/spikes/primevue-evaluation.md for how much further this would
// need to go to be indistinguishable from the existing design system.
export const spikePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#eef2f4",
      100: "#d3dce1",
      200: "#b8c6cd",
      300: "#9db0ba",
      400: "#7f97a3",
      500: "#5c7885",
      600: "#3d5866",
      700: "#274552",
      800: "#1a323d",
      900: "#152a33",
      950: "#0f1f27",
    },
  },
});
