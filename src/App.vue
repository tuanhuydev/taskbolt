<template>
	<div id="taskbolt" class="relative h-full w-full overflow-hidden">
		<AppLayout />
	</div>
</template>

<script setup lang="ts">
import type { Plugin } from "vue";
import { getCurrentInstance } from "vue";
import AppLayout from "@/shared/components/layout/AppLayout.vue";
import "@/shared/styles/globals.css";
import { shellServicesPlugin } from "@/shared/plugins/shell-services";
import { createAppRouter } from "@/router";

const app = getCurrentInstance()!.appContext.app;

if (!app.config.globalProperties.$router) {
  app.use(shellServicesPlugin);
  const router = createAppRouter("/dashboard/taskbolt");
  app.use(router as unknown as Plugin);
}
</script>
