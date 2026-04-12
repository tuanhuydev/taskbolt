<template>
	<div id="taskbolt">
		<AppLayout />
	</div>
</template>

<script setup lang="ts">
import type { Plugin } from "vue";
import { getCurrentInstance } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import "@/styles/globals.css";
import { shellServicesPlugin } from "@/plugins/shell-services";
import { createAppRouter } from "@/router";

const props = withDefaults(
	defineProps<{ basePath?: string; embedded?: boolean }>(),
	{
		basePath: "/dashboard/taskbolt",
		embedded: true,
	},
);

const app = getCurrentInstance()!.appContext.app;

if (!app.config.globalProperties.$router) {
	app.use(shellServicesPlugin);
	const router = createAppRouter(props.basePath, props.embedded);
	app.use(router as unknown as Plugin);
}
</script>
