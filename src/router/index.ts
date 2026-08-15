import { createRouter, createWebHistory } from "vue-router";
import ActiveSprintPage from "@/features/active-sprint/ActiveSprintPage.vue";
import BacklogsPage from "@/features/backlogs/BacklogsPage.vue";
import TaskDetailPage from "@/features/backlogs/TaskDetailPage.vue";
import TaskLinkPage from "@/features/backlogs/TaskLinkPage.vue";
import ReportsPage from "@/features/reports/ReportsPage.vue";
import ConfigurePage from "@/features/configure/ConfigurePage.vue";
import ConfigureHomePage from "@/features/configure/ConfigureHomePage.vue";
import ConfigureProjectsPage from "@/features/configure/ConfigureProjectsPage.vue";
import ProjectDetailPage from "@/features/projects/ProjectDetailPage.vue";
import HomePage from "@/features/home/HomePage.vue";
import PrimeVueSpikePage from "@/features/spike-primevue/PrimeVueSpikePage.vue";

const routes = [
	{
		path: "/",
		redirect: "/home",
	},
	{
		// :projectId is optional so the personal-workspace URL (/home) still
		// resolves — present, it's the deep-linkable URL for that project's
		// view, kept in sync with the sidebar's selected-project context via
		// useProjectRouteSync().
		path: "/:projectId?/home",
		name: "home",
		component: HomePage,
	},
	{
		path: "/:projectId?/active-sprint",
		name: "active-sprint",
		component: ActiveSprintPage,
	},
	{
		path: "/:projectId?/backlogs",
		name: "backlogs",
		component: BacklogsPage,
	},
	{
		// Dedicated, shareable task detail page — separate from the
		// `backlogs?task=<id>` drawer used for quick access from the list.
		path: "/:projectId?/backlogs/:taskId",
		name: "task-detail",
		component: TaskDetailPage,
	},
	{
		// Deep link: resolves a bare task id to its project, then redirects
		// into Backlogs with that task pre-selected.
		path: "/tasks/:taskId",
		name: "task-link",
		component: TaskLinkPage,
	},
	{
		path: "/:projectId?/reports",
		name: "reports",
		component: ReportsPage,
	},
	// Not linked from any nav — spike/primevue-evaluation prototype only.
	{
		path: "/spike/primevue",
		name: "spike-primevue",
		component: PrimeVueSpikePage,
	},
	{
		path: "/configure",
		name: "configure",
		component: ConfigurePage,
		children: [
			{
				// projectId is optional so /configure alone still resolves (the
				// "Personal workspace" state) — present, it's the deep-linkable,
				// copy/paste-able URL for a specific project's configure view,
				// kept in sync with the sidebar's selected-project context.
				path: ":projectId?",
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
