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
    <TaskItem v-for="task in taskList" :task="task" @click="selectTask" />
    <div v-if="parentTasks.length === 0" class="text-muted-foreground">
      No tasks found.
    </div>
  </ul>
  <TaskDetail
    :task="selectedTask"
    :open="shouldShowTaskDetail"
    @close="closeTaskDetail"
    @update="handleUpdateTask"
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
import { Task } from "@/shared/types/task";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import TaskItem from "@/shared/components/ui/task-item/TaskItem.vue";
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

const subTaskMap = computed(() => {
  const map: Record<string, Task[]> = {};
  for (const task of taskList.value) {
    if (task.parentId) {
      if (!map[task.parentId]) map[task.parentId] = [];
      map[task.parentId].push(task);
    }
  }
  return map;
});

const parentTasks = computed(() => taskList.value.filter((t) => !t.parentId));
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
   const filter: Record<string, string> = {
    sortOrder: "desc",
    sortBy: "createdAt",
   };
   
   // Add projectId filter if a project is selected
   if (selectedProjectId.value) {
     filter.projectId = selectedProjectId.value;
   }
   
   const tasks = await getTasks(apiClient, filter);
    taskList.value = tasks;
  } catch (err: any) {
    error.value = err.message || "Failed to load tasks.";
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

async function handleTaskSubmit(data: any, isEdit: boolean) {
  const apiClient = getApiClient();
  const toastService = getToastService();

  if (!apiClient) {
    console.error("API client not available");
    toastService?.error("API client not available");
    return;
  }

  try {
    let response;
    
    if (isEdit) {
      // Update existing task
      const taskId = data.id;
      delete data.id; // Remove id from body
      
      response = await apiClient.request(`${APP_AUTH_URL}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } else {
      // Create new task - add projectId if selected
      const taskData = {
        ...data,
        ...(selectedProjectId.value && { projectId: selectedProjectId.value }),
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
      throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} task`);
    }

    // Success
    toastService?.success(isEdit ? "Task updated successfully" : "Task created successfully");
    closeTaskForm();
    
    // Refresh task list
    await fetchTasks();
  } catch (err: any) {
    console.error("Error submitting task:", err);
    toastService?.error(err.message || "Failed to submit task");
  }
}

async function handleUpdateTask(data: any) {
  await handleTaskSubmit(data, true);
}
</script>
