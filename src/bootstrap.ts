import type { Plugin } from "vue";
import { createApp, type App } from "vue";
import AppRoot from "./App.vue";
import { shellServicesPlugin } from "@/shared/plugins/shell-services";
import { createAppRouter } from "@/router";

// Default export for backward compatibility with component-based loaders
export default AppRoot;

let app: App | null = null;



export function mount(el: string | HTMLElement) {
    app = createApp(AppRoot);
    app.use(shellServicesPlugin);
    const router = createAppRouter("/dashboard/taskbolt");
    app.use(router as unknown as Plugin);
    app.mount(el);
    return { app, router };
}

export function unmount() {
	app?.unmount();
	app = null;
}
