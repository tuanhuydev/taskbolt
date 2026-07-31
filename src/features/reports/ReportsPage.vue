<template>
  <div class="flex flex-col gap-4">
    <div>
      <h2 class="text-2xl font-semibold">{{ t("reports.title") }}</h2>
      <p class="text-sm text-muted-foreground">{{ t("reports.subtitle") }}</p>
    </div>

    <div
      class="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4"
    >
      <div class="min-w-40">
        <label class="text-xs font-medium text-muted-foreground block mb-1.5">
          {{ t("reports.filterSprint") }}
        </label>
        <Select v-model="selectedSprintId">
          <SelectTrigger>
            <SelectValue :placeholder="t('reports.filterSprintPlaceholder')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="sprint in sprints" :key="sprint.id" :value="sprint.id">
              {{ sprint.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-muted-foreground">{{ t("common.loading") }}</p>
    <p v-else-if="error" class="text-sm text-destructive">{{ error }}</p>
    <p v-else-if="!selectedSprintId" class="text-sm text-muted-foreground">
      {{ t("reports.noSprints") }}
    </p>

    <template v-else>
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div
          v-for="card in kpiCards"
          :key="card.label"
          class="rounded-lg border bg-white p-4"
        >
          <span class="text-xs font-semibold text-muted-foreground block mb-2">
            {{ card.label }}
          </span>
          <div class="flex items-baseline gap-1 font-mono">
            <span class="text-2xl font-bold" :class="card.colorClass ?? 'text-foreground'">
              {{ card.value }}
            </span>
            <span v-if="card.suffix" class="text-base text-muted-foreground">
              {{ card.suffix }}
            </span>
          </div>
          <div v-if="card.showBar" class="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-3">
            <div class="h-full rounded-full bg-teal-600" :style="{ width: card.value + '%' }" />
          </div>
          <p v-else class="text-xs text-muted-foreground mt-2.5">{{ card.sub }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
        <ReportBurndownChart
          :total-points="totalPoints"
          :remaining-points="totalPoints - donePoints"
          :start-date="selectedSprint?.startDate ?? null"
          :end-date="selectedSprint?.endDate ?? null"
        />
        <ReportTaskBreakdown :counts="statusCounts" />
      </div>

      <ReportTaskList :tasks="taskListRows" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useProjectRouteSync } from "@/shared/composables/useProjectRouteSync";
import { useProjectContext } from "@/shared/composables/useProject";
import { useProjectTasks } from "@/shared/composables/useProjectTasks";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { TaskStatus } from "@/shared/types/task";
import { SprintStatus } from "@/shared/types/sprint";
import { formatTicketId } from "@/shared/lib/task-display";
import { getInitials, colorForKey } from "@/shared/lib/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import ReportBurndownChart from "./ReportBurndownChart.vue";
import ReportTaskBreakdown from "./ReportTaskBreakdown.vue";
import ReportTaskList from "./ReportTaskList.vue";

useProjectRouteSync();

const { t } = useTaskboltTranslation();
const { selectedProjectId } = useProjectContext();

const selectedSprintId = ref<string | null>(null);

const {
  taskList,
  members,
  sprints,
  loading,
  error,
  fetchTasks,
  fetchMembersAndSprints,
} = useProjectTasks(selectedProjectId, {
  sprintId: selectedSprintId,
});

const selectedSprint = computed(
  () => sprints.value.find((s) => s.id === selectedSprintId.value) ?? null,
);

// Default to the active sprint once sprints load; fall back to the most
// recent one if none is active. Re-runs whenever the sprint list changes
// (project switch) so a stale sprint from a previous project never lingers.
watch(sprints, (list) => {
  if (selectedSprintId.value && list.some((s) => s.id === selectedSprintId.value)) {
    return;
  }
  const active = list.find((s) => s.status === SprintStatus.ACTIVE);
  selectedSprintId.value = active?.id ?? list[0]?.id ?? null;
});

watch(selectedSprintId, fetchTasks, { immediate: true });

async function loadForProject() {
  await fetchMembersAndSprints();
}

onMounted(loadForProject);
watch(selectedProjectId, loadForProject);

const memberMap = computed(() => {
  const map = new Map<string, string>();
  members.value.forEach((m) => map.set(m.userId, m.userName));
  return map;
});

// Closed tasks are obsoleted work — excluded from progress/breakdown, same
// rationale as Active Sprint's board stats.
const activeTasks = computed(() =>
  taskList.value.filter((task) => task.status !== TaskStatus.CLOSED),
);

const donePoints = computed(() =>
  activeTasks.value
    .filter((task) => task.status === TaskStatus.DONE)
    .reduce((sum, task) => sum + (task.storyPoint ?? 0), 0),
);
const totalPoints = computed(() =>
  activeTasks.value.reduce((sum, task) => sum + (task.storyPoint ?? 0), 0),
);
const doneCount = computed(
  () => activeTasks.value.filter((task) => task.status === TaskStatus.DONE).length,
);
const totalCount = computed(() => activeTasks.value.length);
const progressPct = computed(() =>
  totalPoints.value ? Math.round((donePoints.value / totalPoints.value) * 100) : 0,
);

const daysLeft = computed(() => {
  if (!selectedSprint.value?.endDate) return null;
  const end = new Date(selectedSprint.value.endDate);
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
});

const statusCounts = computed(() => ({
  [TaskStatus.TODO]: activeTasks.value.filter((t) => t.status === TaskStatus.TODO).length,
  [TaskStatus.IN_PROGRESS]: activeTasks.value.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
  [TaskStatus.IN_REVIEW]: activeTasks.value.filter((t) => t.status === TaskStatus.IN_REVIEW).length,
  [TaskStatus.DONE]: doneCount.value,
}));

const kpiCards = computed(() => [
  {
    label: t("reports.kpiProgress"),
    value: String(progressPct.value),
    showBar: true,
  },
  {
    label: t("reports.kpiTasksDone"),
    value: String(doneCount.value),
    suffix: `/${totalCount.value}`,
    sub: t("reports.kpiTasksDoneSub").replace(
      "{{count}}",
      String(totalCount.value - doneCount.value),
    ),
  },
  {
    label: t("reports.kpiStoryPoints"),
    value: String(donePoints.value),
    suffix: `/${totalPoints.value}`,
    sub: t("reports.kpiStoryPointsSub").replace(
      "{{count}}",
      String(totalPoints.value - donePoints.value),
    ),
  },
  {
    label: t("reports.kpiTimeLeft"),
    value: daysLeft.value === null ? "–" : String(daysLeft.value),
    suffix: daysLeft.value === null ? undefined : t("reports.kpiTimeLeftSuffix"),
    colorClass: "text-amber-600",
    sub: selectedSprint.value?.endDate
      ? t("reports.kpiTimeLeftSub").replace(
          "{{date}}",
          new Date(selectedSprint.value.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        )
      : "",
  },
]);

const taskListRows = computed(() =>
  activeTasks.value.map((task) => {
    const assigneeName = task.assigneeId
      ? memberMap.value.get(task.assigneeId) ?? t("taskDetail.unassigned")
      : t("taskDetail.unassigned");
    return {
      key: formatTicketId(task.id),
      title: task.title,
      status: task.status as TaskStatus.TODO | TaskStatus.IN_PROGRESS | TaskStatus.IN_REVIEW | TaskStatus.DONE,
      assignee: assigneeName,
      initials: task.assigneeId ? getInitials(assigneeName) : "–",
      avatarClass: task.assigneeId ? colorForKey(task.assigneeId) : "bg-slate-300",
      points: task.storyPoint ?? 0,
    };
  }),
);
</script>
