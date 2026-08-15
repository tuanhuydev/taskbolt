<template>
  <div id="taskbolt" class="relative h-full w-full overflow-hidden">
    <TooltipProvider>
      <AppLayout />
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import type { Plugin } from "vue";
import { getCurrentInstance } from "vue";
import PrimeVue from "primevue/config";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import AppLayout from "@/shared/components/layout/AppLayout.vue";
import "@/shared/styles/globals.css";
import { shellServicesPlugin } from "@/shared/plugins/shell-services";
import { createAppRouter } from "@/router";
import { createPinia } from "pinia";
import { spikePreset } from "@/features/spike-primevue/theme";

const app = getCurrentInstance()!.appContext.app;
const pinia = createPinia()


if (!app.config.globalProperties.$router) {
  app.use(shellServicesPlugin);
  app.use(pinia)
  const router = createAppRouter("/dashboard/taskbolt");
  app.use(router as unknown as Plugin);
  // spike/primevue-evaluation — scoped to this app's own Vue instance,
  // only used by the one prototype route. See
  // docs/spikes/primevue-evaluation.md.
  app.use(PrimeVue, { theme: { preset: spikePreset } });
}

</script>
