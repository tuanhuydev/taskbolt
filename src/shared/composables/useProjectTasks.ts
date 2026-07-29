import { ref, type Ref } from "vue";
import { useShellServices } from "@/shared/composables/useShellServices";
import {
  getTasks,
  getProjectMembers,
  getSprints,
  createTask as createTaskRequest,
  updateTask as updateTaskRequest,
  deleteTask as deleteTaskRequest,
} from "@/shared/services";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "@/shared/types/task";
import type { ProjectMember } from "@/shared/types/member";
import type { Sprint } from "@/shared/types/sprint";

export interface ProjectTaskFilters {
  statuses?: Ref<TaskStatus[]>;
  priorities?: Ref<TaskPriority[]>;
  // Scopes fetchTasks to a single sprint (Active Sprint board) instead of
  // the whole project (Backlog). When provided, fetchTasks clears the list
  // rather than falling back to unscoped project tasks while no sprint has
  // resolved yet (e.g. before the active sprint lookup completes).
  sprintId?: Ref<string | null>;
}

/**
 * Fetches the task list, project members and sprints for a project, and
 * orchestrates task create/update (service call + list refresh) — shared
 * between BacklogsPage, TaskDetailPage, and ActiveSprintPage so all three
 * read and write tasks the same way instead of each re-implementing it.
 */
export function useProjectTasks(
  selectedProjectId: Ref<string | null>,
  filters: ProjectTaskFilters = {},
) {
  const { getApiClient } = useShellServices();

  const taskList = ref<Task[]>([]);
  const members = ref<ProjectMember[]>([]);
  const sprints = ref<Sprint[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const membersError = ref<string | null>(null);
  const sprintsError = ref<string | null>(null);

  // Guards against out-of-order responses: rapid filter/project changes can
  // fire overlapping requests whose responses resolve out of order, and a
  // slower older response landing after a newer one must not clobber it.
  let latestRequestId = 0;

  async function fetchTasks() {
    if (filters.sprintId && !filters.sprintId.value) {
      taskList.value = [];
      loading.value = false;
      error.value = null;
      return;
    }

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
      if (filters.sprintId?.value) {
        filter.sprintId = filters.sprintId.value;
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

    membersError.value = null;
    sprintsError.value = null;

    if (!apiClient || !projectId) {
      members.value = [];
      sprints.value = [];
      return;
    }

    // Resolved independently (not Promise.all) so one failing doesn't hide
    // the other's success or its own specific error from the UI.
    const [membersResult, sprintsResult] = await Promise.allSettled([
      getProjectMembers(apiClient, projectId),
      getSprints(apiClient, { projectId }),
    ]);

    if (membersResult.status === "fulfilled") {
      members.value = membersResult.value;
    } else {
      console.error("Error fetching project members:", membersResult.reason);
      membersError.value =
        membersResult.reason instanceof Error
          ? membersResult.reason.message
          : "Failed to load project members.";
    }

    if (sprintsResult.status === "fulfilled") {
      sprints.value = sprintsResult.value;
    } else {
      console.error("Error fetching sprints:", sprintsResult.reason);
      sprintsError.value =
        sprintsResult.reason instanceof Error
          ? sprintsResult.reason.message
          : "Failed to load sprints.";
    }
  }

  // Same apiClient-guard for every consumer instead of re-deriving it
  // inline. Deliberately does NOT refetch on success — callers that want a
  // full-list refresh call fetchTasks() themselves; callers doing a
  // targeted optimistic update (e.g. drag-drop) apply the result directly
  // and skip the round-trip a refetch would force.
  async function createTask(payload: CreateTaskPayload): Promise<Task> {
    const apiClient = getApiClient();
    if (!apiClient) throw new Error("API client not available from shell.");
    return await createTaskRequest(apiClient, payload);
  }

  async function updateTask(
    taskId: string,
    payload: Omit<UpdateTaskPayload, "id">,
  ): Promise<Task> {
    const apiClient = getApiClient();
    if (!apiClient) throw new Error("API client not available from shell.");
    return await updateTaskRequest(apiClient, taskId, payload);
  }

  async function deleteTask(taskId: string): Promise<void> {
    const apiClient = getApiClient();
    if (!apiClient) throw new Error("API client not available from shell.");
    await deleteTaskRequest(apiClient, taskId);
  }

  return {
    taskList,
    members,
    sprints,
    loading,
    error,
    membersError,
    sprintsError,
    fetchTasks,
    fetchMembersAndSprints,
    createTask,
    updateTask,
    deleteTask,
  };
}
