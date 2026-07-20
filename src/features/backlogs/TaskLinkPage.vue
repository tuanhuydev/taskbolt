<template>
  <div class="flex-1 flex items-center justify-center">
    <p v-if="error" class="text-destructive text-sm">{{ error }}</p>
    <p v-else class="text-muted-foreground text-sm">{{ t("common.loading") }}</p>
  </div>
</template>

<script setup lang="ts">
// Deep-link resolver: /tasks/:taskId has no UI of its own — it looks the
// task up, switches the shared project context to the task's own project
// so Backlogs loads the right task list, then redirects there with the
// task pre-selected.
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import { useProjectContext } from "@/shared/composables/useProject";
import { getTaskById } from "@/shared/services";

const route = useRoute();
const router = useRouter();
const { getApiClient } = useShellServices();
const { t } = useTaskboltTranslation();
const { setSelectedProjectId } = useProjectContext();

const error = ref<string | null>(null);

onMounted(async () => {
  const apiClient = getApiClient();
  const taskId = route.params.taskId as string;

  if (!apiClient) {
    error.value = t("toast.apiClientUnavailable");
    return;
  }

  try {
    const task = await getTaskById(apiClient, taskId);
    setSelectedProjectId(task.projectId ?? null);
    router.replace({ name: "backlogs", query: { task: task.id } });
  } catch {
    error.value = t("taskLink.notFound");
  }
});
</script>
