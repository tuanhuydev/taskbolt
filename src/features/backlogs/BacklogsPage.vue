<template>
  <h2 class="text-2xl font-semibold mb-3">Backlogs</h2>
  <header
    class="bg-background flex flex-wrap-reverse items-center justify-between gap-3 p-2 mb-3 rounded-md"
  >
    <div class="flex items-center gap-4 w-full sm:w-auto">
      <Input
        type="text"
        :placeholder="t('header.searchPlaceholder')"
        class="w-full sm:w-64"
      />
    </div>

    <div class="flex items-center gap-4">
      <label
        class="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none whitespace-nowrap"
      >
        <Checkbox
          :model-value="showClosedTasks"
          @update:model-value="(v) => (showClosedTasks = !!v)"
        />
        {{ t("backlogs.showClosed") }}
      </label>
      <BacklogFilters
        :statuses="selectedStatuses"
        :priorities="selectedPriorities"
        @update:statuses="selectedStatuses = $event"
        @update:priorities="selectedPriorities = $event"
      />
      <Button @click="openTaskForm">
        {{ t("header.newIssue") }}
      </Button>
    </div>
  </header>
  <p v-if="loading" class="text-muted-foreground">Loading tasks…</p>
  <p v-else-if="error" class="text-destructive">{{ error }}</p>

  <ul
    v-else
    class="list-none overflow-auto max-h-4/5 p-2 bg-white rounded-md flex-1"
  >
    <BacklogSprintRow
      v-for="group in sprintGroups"
      :key="group.sprint?.id ?? 'backlog'"
      :sprint="group.sprint"
      :tasks="group.tasks"
      :sub-task-map="subTaskMap"
      :active-task-id="selectedTask?.id ?? null"
      @click="selectTask"
    />
    <li v-if="parentTasks.length === 0" class="text-muted-foreground">
      No tasks found.
    </li>
  </ul>
  <TaskDetail
    :task="selectedTask"
    :tasks="taskList"
    :members="members"
    :sprints="sprints"
    :open="shouldShowTaskDetail"
    @close="closeTaskDetail"
    @update="handleUpdateTask"
    @create="handleCreateTask"
  />
  <TaskForm
    :open="showTaskForm"
    :members="members"
    :sprints="sprints"
    @submit="handleTaskSubmit"
    @close="closeTaskForm"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import { useProjectContext } from "@/shared/composables/useProject";
import { useProjectRouteSync } from "@/shared/composables/useProjectRouteSync";
import { useBacklogTasks } from "@/shared/composables/useBacklogTasks";
import { createTask } from "@/shared/services/task.service";
import { APP_AUTH_URL } from "@/shared/lib/constants";
import {
  Task,
  TaskStatus,
  TaskPriority,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import { SprintStatus, type Sprint } from "@/shared/types/sprint";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import TaskDetail from "./TaskDetail.vue";
import BacklogSprintRow from "./BacklogSprintRow.vue";
import BacklogFilters from "./BacklogFilters.vue";
import { TaskForm } from "./index";

const { getApiClient, getToastService } = useShellServices();
const { t } = useTaskboltTranslation();
const { selectedProjectId } = useProjectContext();
const route = useRoute();
useProjectRouteSync();
const selectedTask = ref<Task | null>(null);
const shouldShowTaskDetail = ref<boolean>(false);
const showTaskForm = ref<boolean>(false);
const selectedStatuses = ref<TaskStatus[]>([]);
const selectedPriorities = ref<TaskPriority[]>([]);

const {
  taskList,
  members,
  sprints,
  loading,
  error,
  fetchTasks,
  fetchMembersAndSprints,
} = useBacklogTasks(selectedProjectId, {
  statuses: selectedStatuses,
  priorities: selectedPriorities,
});
// Closed (obsoleted) tasks aren't actionable but shouldn't be deleted —
// hide them from the backlog list by default, toggle to reveal.
const showClosedTasks = ref(false);

const visibleTasks = computed(() =>
  showClosedTasks.value
    ? taskList.value
    : taskList.value.filter((task) => task.status !== TaskStatus.CLOSED),
);

const taskGroups = computed(() => {
  const parentTaskIds = new Set<string>();
  const childTaskMap = new Map<string, Task[]>();
  const parentTaskList: Task[] = [];

  for (const task of visibleTasks.value) {
    if (task.parentId == null) {
      parentTaskIds.add(task.id);
      parentTaskList.push(task);
      continue;
    }

    const existingChildren = childTaskMap.get(task.parentId) ?? [];
    existingChildren.push(task);
    childTaskMap.set(task.parentId, existingChildren);
  }

  return {
    parentTaskIds,
    childTaskMap,
    parentTaskList,
  };
});

const subTaskMap = computed(() => taskGroups.value.childTaskMap);
const parentTasks = computed(() => taskGroups.value.parentTaskList);

interface SprintGroup {
  sprint: Sprint | null;
  tasks: Task[];
}

// Active sprints surface first (what you're working on now), then planned,
// then completed last — the "no sprint" bucket is appended after sorting
// so it always stays at the very bottom regardless of sprint statuses.
const SPRINT_STATUS_ORDER: Record<SprintStatus, number> = {
  [SprintStatus.ACTIVE]: 0,
  [SprintStatus.PLANNED]: 1,
  [SprintStatus.COMPLETED]: 2,
};

// Buckets parent tasks by sprintId so the backlog can be rendered as one
// row per sprint. Tasks whose sprintId doesn't resolve to a fetched sprint
// (e.g. it was deleted) fall back into the "no sprint" bucket.
const sprintGroups = computed<SprintGroup[]>(() => {
  const knownSprintIds = new Set(sprints.value.map((sprint) => sprint.id));
  const tasksBySprintId = new Map<string, Task[]>();
  const noSprintTasks: Task[] = [];

  for (const task of parentTasks.value) {
    if (task.sprintId && knownSprintIds.has(task.sprintId)) {
      const existing = tasksBySprintId.get(task.sprintId) ?? [];
      existing.push(task);
      tasksBySprintId.set(task.sprintId, existing);
    } else {
      noSprintTasks.push(task);
    }
  }

  const groups: SprintGroup[] = sprints.value
    .filter((sprint) => tasksBySprintId.has(sprint.id))
    .map((sprint) => ({
      sprint,
      tasks: tasksBySprintId.get(sprint.id) ?? [],
    }))
    .sort(
      (a, b) =>
        SPRINT_STATUS_ORDER[a.sprint!.status] -
        SPRINT_STATUS_ORDER[b.sprint!.status],
    );

  groups.push({ sprint: null, tasks: noSprintTasks });

  return groups;
});

onMounted(async () => {
  await Promise.all([fetchTasks(), fetchMembersAndSprints()]);

  // Arriving via a /tasks/:taskId deep link (TaskLinkPage) — open that
  // task's detail once the list it belongs to has loaded.
  const deepLinkedTaskId = route.query.task as string | undefined;
  if (deepLinkedTaskId) {
    const task = taskList.value.find((t) => t.id === deepLinkedTaskId);
    if (task) selectTask(task);
  }
});

// Watch for project changes and refetch tasks
watch(selectedProjectId, async () => {
  await Promise.all([fetchTasks(), fetchMembersAndSprints()]);
});

// Refetch whenever the status/priority filter selection changes — filtering
// happens server-side so it composes with pagination/sorting correctly.
watch([selectedStatuses, selectedPriorities], fetchTasks);

const selectTask = (task: Task) => {
  selectedTask.value = task;
  shouldShowTaskDetail.value = true;
};

const closeTaskDetail = () => {
  shouldShowTaskDetail.value = false;
};

const openTaskForm = () => {
  showTaskForm.value = true;
};

const closeTaskForm = () => {
  showTaskForm.value = false;
};

async function handleTaskSubmit(
  data: CreateTaskPayload | UpdateTaskPayload,
  isEdit: boolean,
) {
  const apiClient = getApiClient();
  const toastService = getToastService();

  if (!apiClient) {
    console.error("API client not available");
    toastService?.error(t("toast.apiClientUnavailable"));
    return;
  }

  try {
    if (isEdit) {
      // Update existing task
      const { id: taskId, ...body } = data as UpdateTaskPayload;

      const response = await apiClient.request(`${APP_AUTH_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update task");
      }
    } else {
      // Create new task - always include projectId (null for personal workspace)
      await createTask(apiClient, {
        ...(data as CreateTaskPayload),
        projectId: selectedProjectId.value,
      });
    }

    // Success
    toastService?.success(
      isEdit ? t("toast.taskUpdated") : t("toast.taskCreated"),
    );
    closeTaskForm();

    // Refresh task list
    await fetchTasks();
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : isEdit
          ? t("toast.taskUpdateFailed")
          : t("toast.taskCreateFailed");
    console.error("Error submitting task:", err);
    toastService?.error(message);
  }
}

async function handleUpdateTask(data: UpdateTaskPayload) {
  await handleTaskSubmit(data, true);
}

async function handleCreateTask(data: CreateTaskPayload) {
  await handleTaskSubmit(data, false);
}
</script>
