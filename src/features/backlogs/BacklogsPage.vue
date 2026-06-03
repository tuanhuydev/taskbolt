<template>
  <h2 class="text-2xl font-semibold mb-6">Backlogs</h2>
  <header class="h-14 bg-background flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Input
        type="text"
        :placeholder="t('header.searchPlaceholder')"
        class="w-64"
      />
    </div>

    <div class="flex items-center gap-3">
      <Button @click="openTaskForm">
        {{ t("header.newIssue") }}
      </Button>
    </div>
  </header>
  <p v-if="loading" class="text-muted-foreground">Loading tasks…</p>
  <p v-else-if="error" class="text-destructive">{{ error }}</p>

  <ul v-else class="p-0 list-none overflow-auto max-h-4/5">
    <TaskGroup
      v-for="task in parentTasks"
      :key="task.id"
      :task="task"
      :sub-tasks="subTaskMap.get(task.id) ?? []"
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
    :open="shouldShowTaskDetail"
    @close="closeTaskDetail"
    @update="handleUpdateTask"
    @create="handleCreateTask"
  />
  <TaskForm
    :open="showTaskForm"
    @submit="handleTaskSubmit"
    @close="closeTaskForm"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import { useProjectContext } from "@/shared/composables/useProject";
import { APP_AUTH_URL } from "@/shared/lib/constants";
import {
  Task,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { TaskGroup } from "@/shared/components/ui/task-item";
import TaskDetail from "./TaskDetail.vue";
import { TaskForm } from "./index";
import { getTasks } from "@/shared/services";

const { getApiClient, getToastService } = useShellServices();
const { t } = useTaskboltTranslation();
const { selectedProjectId } = useProjectContext();
const selectedTask = ref<Task | null>(null);
const shouldShowTaskDetail = ref<boolean>(false);
const showTaskForm = ref<boolean>(false);

const taskList = ref<Task[]>([]);

const taskGroups = computed(() => {
  const parentTaskIds = new Set<string>();
  const childTaskMap = new Map<string, Task[]>();
  const parentTaskList: Task[] = [];

  for (const task of taskList.value) {
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
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  await fetchTasks();
});

// Watch for project changes and refetch tasks
watch(selectedProjectId, async () => {
  await fetchTasks();
});

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

    const tasks = await getTasks(apiClient, filter);
    taskList.value = tasks;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to load tasks.";
    error.value = message;
  } finally {
    loading.value = false;
  }
}

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
    let response;

    if (isEdit) {
      // Update existing task
      const { id: taskId, ...body } = data as UpdateTaskPayload;

      response = await apiClient.request(`${APP_AUTH_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } else {
      // Create new task - always include projectId (null for personal workspace)
      const taskData = {
        ...data,
        projectId: selectedProjectId.value,
      };

      response = await apiClient.request(`${APP_AUTH_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to ${isEdit ? "update" : "create"} task`,
      );
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
