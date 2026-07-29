<template>
  <div class="flex flex-col h-full">
    <button
      type="button"
      class="mb-3 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      @click="goBack"
    >
      <ArrowLeft class="h-4 w-4" />
      {{ t("taskDetail.backToBacklogs") }}
    </button>

    <p v-if="loading" class="text-muted-foreground">{{ t("common.loading") }}</p>
    <p v-else-if="error" class="text-destructive">{{ error }}</p>
    <p v-else-if="!task" class="text-muted-foreground">{{ t("taskLink.notFound") }}</p>

    <div
      v-else
      class="flex-1 min-h-0 flex flex-col border rounded-md bg-white overflow-hidden"
    >
      <TaskDetailContent
        :task="task"
        :tasks="taskList"
        :members="members"
        :sprints="sprints"
        @close="goBack"
        @update="handleUpdateTask"
        @create="handleCreateTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import { useProjectContext } from "@/shared/composables/useProject";
import { useProjectRouteSync } from "@/shared/composables/useProjectRouteSync";
import { useProjectTasks } from "@/shared/composables/useProjectTasks";
import type { CreateTaskPayload, UpdateTaskPayload } from "@/shared/types/task";
import TaskDetailContent from "@/shared/domain-ui/task/TaskDetailContent.vue";

const { getToastService } = useShellServices();
const { t } = useTaskboltTranslation();
const route = useRoute();
const router = useRouter();
const { selectedProjectId } = useProjectContext();
useProjectRouteSync();

const {
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
} = useProjectTasks(selectedProjectId);

// Members/sprints are secondary data — surface failures as a toast rather
// than blocking the page like the primary task-fetch `error`.
watch(membersError, (message) => {
  if (message) getToastService()?.error(t("toast.membersLoadFailed"));
});
watch(sprintsError, (message) => {
  if (message) getToastService()?.error(t("toast.sprintsLoadFailed"));
});

const taskId = computed(() => route.params.taskId as string);
const task = computed(
  () => taskList.value.find((candidate) => candidate.id === taskId.value) ?? null,
);

async function loadAll() {
  await Promise.all([fetchTasks(), fetchMembersAndSprints()]);
}

onMounted(loadAll);
watch(selectedProjectId, loadAll);

function goBack() {
  router.push({
    name: "backlogs",
    params: { projectId: route.params.projectId },
  });
}

async function handleUpdateTask(data: UpdateTaskPayload) {
  const toastService = getToastService();

  try {
    const { id, ...body } = data;
    await updateTask(id, body);
    toastService?.success(t("toast.taskUpdated"));
    await fetchTasks();
  } catch (err: unknown) {
    console.error("Error updating task:", err);
    toastService?.error(t("toast.taskUpdateFailed"));
  }
}

async function handleCreateTask(data: CreateTaskPayload) {
  const toastService = getToastService();

  try {
    await createTask({ ...data, projectId: selectedProjectId.value });
    toastService?.success(t("toast.taskCreated"));
    await fetchTasks();
  } catch (err: unknown) {
    console.error("Error creating task:", err);
    toastService?.error(t("toast.taskCreateFailed"));
  }
}
</script>
