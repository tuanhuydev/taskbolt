import { createRouter, createWebHistory } from "vue-router";
import ActiveSprintPage from "@/features/active-sprint/ActiveSprintPage.vue";
import BacklogsPage from "@/features/backlogs/BacklogsPage.vue";
import ReportsPage from "@/features/reports/ReportsPage.vue";
import ConfigurePage from "@/features/configure/ConfigurePage.vue";

const routes = [
	{
		path: "/",
		redirect: "/active-sprint",
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
	{
		path: "/configure/projects/:projectId",
		name: "project-detail",
		component: () => import("@/features/projects/ProjectDetailPage.vue"),
	},
];

/**
 * Uses web history for full URL-based navigation. Pass base path if needed.
 */
export function createAppRouter(base = "/") {
	return createRouter({ history: createWebHistory(base), routes });
}
