import { ref, type Ref } from "vue";
import { useShellServices } from "@/shared/composables/useShellServices";
import { getTasks, getProjectMembers, getSprints } from "@/shared/services";
import type { Task, TaskStatus, TaskPriority } from "@/shared/types/task";
import type { ProjectMember } from "@/shared/types/member";
import type { Sprint } from "@/shared/types/sprint";

export interface BacklogTaskFilters {
  statuses?: Ref<TaskStatus[]>;
  priorities?: Ref<TaskPriority[]>;
}

/**
 * Fetches the task list, project members and sprints for a project — shared
 * between BacklogsPage (drawer entry point) and TaskDetailPage (dedicated
 * page entry point) so both resolve tasks/sprints/members the same way.
 */
export function useBacklogTasks(
  selectedProjectId: Ref<string | null>,
  filters: BacklogTaskFilters = {},
) {
  const { getApiClient } = useShellServices();

  const taskList = ref<Task[]>([]);
  const members = ref<ProjectMember[]>([]);
  const sprints = ref<Sprint[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  // Guards against out-of-order responses: rapid filter/project changes can
  // fire overlapping requests whose responses resolve out of order, and a
  // slower older response landing after a newer one must not clobber it.
  let latestRequestId = 0;

  async function fetchTasks() {
    const apiClient = getApiClient();
    const requestId = ++latestRequestId;

    if (!apiClient) {
      if (requestId === latestRequestId) {
        error.value = "API client not available from shell.";
        loading.value = false;
      }
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

      if (filters.statuses?.value.length) {
        filter.status = filters.statuses.value.join(",");
      }
      if (filters.priorities?.value.length) {
        filter.priority = filters.priorities.value.join(",");
      }

      const result = await getTasks(apiClient, filter);
      if (requestId !== latestRequestId) return;
      taskList.value = result;
    } catch (err: unknown) {
      if (requestId !== latestRequestId) return;
      const message =
        err instanceof Error ? err.message : "Failed to load tasks.";
      error.value = message;
    } finally {
      if (requestId === latestRequestId) loading.value = false;
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
