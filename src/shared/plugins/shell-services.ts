import type { App } from "vue";
import {
	SHELL_SERVICES_KEY,
	getShellServiceRegistry,
} from "@/shared/composables/useShellServices";

/**
 * Vue plugin to provide shell services globally
 * This makes services available via inject() throughout the app
 */
export const shellServicesPlugin = {
	install(app: App) {
		const registry = getShellServiceRegistry();

		if (registry) {
			// Provide the registry globally
			app.provide(SHELL_SERVICES_KEY, registry);

			if (import.meta.env.DEV) {
				console.log(
					"[Shell Services] Successfully connected to shell service registry",
				);

				// Debug: Log available services
				if (registry.list) {
					const availableServices = registry.list();
					console.log("[Shell Services] Available services:", availableServices);
					console.log(
						"[Shell Services] Registry info:",
						registry.getRegistryInfo?.(),
					);
				}
			}
		} else {
			console.warn(
				"[Shell Services] Shell service registry not found on window.__SHELL_SERVICES__",
			);
		}
	},
};
