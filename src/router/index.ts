import {
	createRouter,
	createWebHistory,
	createMemoryHistory,
} from "vue-router";
import ActiveSprintPage from "@/views/ActiveSprintPage.vue";
import BacklogsPage from "@/views/BacklogsPage.vue";
import ReportsPage from "@/views/ReportsPage.vue";
import ConfigurePage from "@/views/ConfigurePage.vue";

const routes = [
	{
		path: "/",
		name: "home",
		component: ActiveSprintPage,
	},
	{
		path: "/active-sprint",
		name: "active-sprint",
		component: ActiveSprintPage,
	},
	{
		path: "/backlogs",
		name: "backlogs",
		component: BacklogsPage,
	},
	{
		path: "/reports",
		name: "reports",
		component: ReportsPage,
	},
	{
		path: "/configure",
		name: "configure",
		component: ConfigurePage,
	},
];

/**
 * @param base - base path for web history mode
 * @param embedded - true when running inside a shell app (uses memory history to avoid conflicting with the shell's router)
 */
export function createAppRouter(base = "/", embedded = false) {
	const history = embedded ? createMemoryHistory() : createWebHistory(base);

	return createRouter({ history, routes });
}
