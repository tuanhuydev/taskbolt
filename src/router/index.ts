import { createRouter, createWebHistory } from "vue-router";
import ActiveSprintPage from "@/features/active-sprint/ActiveSprintPage.vue";
import BacklogsPage from "@/features/backlogs/BacklogsPage.vue";
import ReportsPage from "@/features/reports/ReportsPage.vue";
import ConfigurePage from "@/features/configure/ConfigurePage.vue";
import ConfigureHomePage from "@/features/configure/ConfigureHomePage.vue";
import ConfigureProjectsPage from "@/features/configure/ConfigureProjectsPage.vue";
import ProjectDetailPage from "@/features/projects/ProjectDetailPage.vue";
import HomePage from "@/features/home/HomePage.vue";

const routes = [
	{
		path: "/",
		redirect: "/home",
	},
	{
		path: "/home",
		name: "home",
		component: HomePage,
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
		children: [
			{
				path: "",
				name: "configure-home",
				component: ConfigureHomePage,
			},
			{
				path: "projects",
				name: "project-list",
				component: ConfigureProjectsPage,
			},
			{
				path: "projects/:projectId",
				name: "project-detail",
				component: ProjectDetailPage,
			}
		],
	},
];

/**
 * Uses web history for full URL-based navigation. Pass base path if needed.
 */
export function createAppRouter(base = "/") {
	return createRouter({ history: createWebHistory(base), routes });
}
