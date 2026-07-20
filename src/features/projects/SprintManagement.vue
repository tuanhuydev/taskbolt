<template>
  <section>
    <div
      class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <h3 class="text-lg font-medium">{{ t("sprint.title") }}</h3>
      <Button size="sm" class="w-full sm:w-auto" @click="openCreateForm">
        {{ t("sprint.addSprint") }}
      </Button>
    </div>

    <p v-if="loading" class="text-muted-foreground text-sm">
      {{ t("common.loading") }}
    </p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <p v-else-if="sprints.length === 0" class="text-muted-foreground text-sm">
      {{ t("sprint.noSprints") }}
    </p>
    <ul v-else class="space-y-2">
      <li
        v-for="sprint in sprints"
        :key="sprint.id"
        class="flex flex-col items-start gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{{ sprint.name }}</p>
          <p v-if="sprint.goal" class="text-sm text-muted-foreground truncate">
            {{ sprint.goal }}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            <span v-if="sprint.startDate">{{
              formatDate(sprint.startDate)
            }}</span>
            <span v-if="sprint.startDate && sprint.endDate"> → </span>
            <span v-if="sprint.endDate">{{ formatDate(sprint.endDate) }}</span>
          </p>
        </div>
        <div
          class="flex w-full items-center justify-between sm:ml-4 sm:w-auto sm:justify-end sm:gap-2 sm:shrink-0"
        >
          <span
            :class="
              cn(
                'text-xs px-2 py-1 rounded-full font-medium',
                statusClasses[sprint.status],
              )
            "
          >
            {{ t(`sprintStatus.${sprint.status}`) }}
          </span>
          <template v-if="props.isAdmin">
            <Button
              variant="ghost"
              size="sm"
              class="h-8 w-8 p-0"
              @click="openEditForm(sprint)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="h-8 w-8 p-0 text-destructive hover:text-destructive"
              @click="confirmDelete(sprint)"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </Button>
          </template>
        </div>
      </li>
    </ul>

    <SprintForm
      :open="showSprintForm"
      :project-id="projectId"
      :initial-data="selectedSprint"
      @submit="handleSprintSubmit"
      @close="closeSprintForm"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Pencil, Trash2 } from "lucide-vue-next";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "@/shared/services";
import { formatDate } from "@/shared/lib/helpers";
import { cn } from "@/shared/lib/utils";
import {
  SprintStatus,
  type Sprint,
  type CreateSprintPayload,
  type UpdateSprintPayload,
} from "@/shared/types/sprint";
import { Button } from "@/shared/components/ui/button";
import SprintForm from "./SprintForm.vue";

const props = withDefaults(
  defineProps<{ projectId: string; isAdmin?: boolean }>(),
  { isAdmin: false },
);

const { getApiClient, getToastService } = useShellServices();
const { t } = useTaskboltTranslation();

const sprints = ref<Sprint[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showSprintForm = ref(false);
const selectedSprint = ref<Sprint | null>(null);

const statusClasses: Record<SprintStatus, string> = {
  [SprintStatus.PLANNED]: "bg-gray-100 text-gray-600",
  [SprintStatus.ACTIVE]: "bg-green-100 text-green-700",
  [SprintStatus.COMPLETED]: "bg-blue-100 text-blue-700",
};

onMounted(fetchSprints);

async function fetchSprints() {
  const apiClient = getApiClient();
  if (!apiClient) {
    error.value = t("toast.apiClientUnavailable");
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    sprints.value = await getSprints(apiClient, { projectId: props.projectId });
  } catch (err) {
    error.value = err instanceof Error ? err.message : t("toast.genericError");
  } finally {
    loading.value = false;
  }
}

function openCreateForm() {
  selectedSprint.value = null;
  showSprintForm.value = true;
}

function openEditForm(sprint: Sprint) {
  selectedSprint.value = sprint;
  showSprintForm.value = true;
}

function closeSprintForm() {
  showSprintForm.value = false;
  selectedSprint.value = null;
}

async function handleSprintSubmit(
  data: CreateSprintPayload | UpdateSprintPayload,
  isEdit: boolean,
) {
  const apiClient = getApiClient();
  const toast = getToastService();

  if (!apiClient) {
    toast?.error(t("toast.apiClientUnavailable"));
    return;
  }

  try {
    if (isEdit) {
      const { id, ...payload } = data as UpdateSprintPayload;
      await updateSprint(apiClient, id, payload);
      toast?.success(t("toast.sprintUpdated"));
    } else {
      await createSprint(apiClient, data as CreateSprintPayload);
      toast?.success(t("toast.sprintCreated"));
    }
    closeSprintForm();
    await fetchSprints();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : t("toast.genericError");
    toast?.error(
      isEdit ? t("toast.sprintUpdateFailed") : t("toast.sprintCreateFailed"),
    );
    console.error("Sprint submit error:", message);
  }
}

async function confirmDelete(sprint: Sprint) {
  if (!window.confirm(`Delete sprint "${sprint.name}"?`)) return;

  const apiClient = getApiClient();
  const toast = getToastService();

  if (!apiClient) {
    toast?.error(t("toast.apiClientUnavailable"));
    return;
  }

  try {
    await deleteSprint(apiClient, sprint.id);
    toast?.success(t("toast.sprintDeleted"));
    await fetchSprints();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : t("toast.genericError");
    toast?.error(t("toast.sprintDeleteFailed"));
    console.error("Sprint delete error:", message);
  }
}
</script>
