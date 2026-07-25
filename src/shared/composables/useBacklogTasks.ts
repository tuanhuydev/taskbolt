import { ref, type Ref } from "vue";
import { useShellServices } from "@/shared/composables/useShellServices";
import { getTasks, getProjectMembers, getSprints } from "@/shared/services";
import type { Task } from "@/shared/types/task";
import type { ProjectMember } from "@/shared/types/member";
import type { Sprint } from "@/shared/types/sprint";

/**
 * Fetches the task list, project members and sprints for a project — shared
 * between BacklogsPage (drawer entry point) and TaskDetailPage (dedicated
 * page entry point) so both resolve tasks/sprints/members the same way.
 */
export function useBacklogTasks(selectedProjectId: Ref<string | null>) {
  const { getApiClient } = useShellServices();

  const taskList = ref<Task[]>([]);
  const members = ref<ProjectMember[]>([]);
  const sprints = ref<Sprint[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  async function fetchTasks() {
    const apiClient = getApiClient();

    if (!apiClient) {
      error.value = "API client not available from shell.";
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const filter: Record<string, string | null> = {
        sortOrder: "desc",
        sortBy: "createdAt",
        projectId: selectedProjectId.value,
      };

      taskList.value = await getTasks(apiClient, filter);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load tasks.";
      error.value = message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMembersAndSprints() {
    const apiClient = getApiClient();
    const projectId = selectedProjectId.value;

    if (!apiClient || !projectId) {
      members.value = [];
      sprints.value = [];
      return;
    }

    try {
      const [projectMembers, projectSprints] = await Promise.all([
        getProjectMembers(apiClient, projectId),
        getSprints(apiClient, { projectId }),
      ]);
      members.value = projectMembers;
      sprints.value = projectSprints;
    } catch (err: unknown) {
      console.error("Error fetching members/sprints:", err);
    }
  }

  return {
    taskList,
    members,
    sprints,
    loading,
    error,
    fetchTasks,
    fetchMembersAndSprints,
  };
}
