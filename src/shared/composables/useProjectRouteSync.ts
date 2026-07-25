import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProjectContext } from "@/shared/composables/useProject";

/**
 * Keeps a route's optional :projectId param in sync (both directions) with
 * the sidebar's shared selectedProjectId context, so a project-scoped page
 * (home/active-sprint/backlogs/reports) always has a deep-linkable,
 * copy/paste-able URL for whichever project is selected — e.g.
 * /dashboard/taskbolt/<projectId>/backlogs?task=<id> — while switching
 * projects from the sidebar still works via the shared context.
 */
export function useProjectRouteSync() {
  const route = useRoute();
  const router = useRouter();
  const { selectedProjectId, setSelectedProjectId } = useProjectContext();

  const routeProjectId = () => (route.params.projectId as string | undefined) || null;

  function syncContextToRoute(projectId: string | null) {
    if (routeProjectId() !== projectId) {
      router.replace({
        name: route.name ?? undefined,
        params: { ...route.params, projectId: projectId ?? undefined },
        query: route.query,
      });
    }
  }

  onMounted(() => {
    const fromRoute = routeProjectId();
    if (fromRoute) {
      if (fromRoute !== selectedProjectId.value) {
        setSelectedProjectId(fromRoute);
      }
    } else if (selectedProjectId.value) {
      // Project already selected (e.g. navigated from another project-scoped
      // page) but this URL doesn't carry it yet — rewrite it so it does.
      syncContextToRoute(selectedProjectId.value);
    }
  });

  watch(selectedProjectId, (projectId) => {
    syncContextToRoute(projectId);
  });

  watch(
    () => route.params.projectId,
    () => {
      const fromRoute = routeProjectId();
      if (fromRoute !== selectedProjectId.value) {
        setSelectedProjectId(fromRoute);
      }
    },
  );
}
