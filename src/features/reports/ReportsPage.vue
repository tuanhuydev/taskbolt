<template>
  <div class="flex flex-col gap-4">
    <div>
      <h2 class="text-2xl font-semibold">{{ t("reports.title") }}</h2>
      <p class="text-sm text-muted-foreground">{{ t("reports.subtitle") }}</p>
    </div>

    <div
      class="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
    >
      <div class="min-w-40">
        <label class="text-xs font-medium text-muted-foreground block mb-1.5">
          {{ t("reports.filterSprint") }}
        </label>
        <Select v-model="filters.sprintId">
          <SelectTrigger>
            <SelectValue :placeholder="t('reports.filterSprintAll')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{{ t("reports.filterSprintAll") }}</SelectItem>
            <SelectItem v-for="sprint in mockSprints" :key="sprint" :value="sprint">
              {{ sprint }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div
        v-for="card in kpiCards"
        :key="card.label"
        class="rounded-lg border bg-card shadow-sm p-4"
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
      <ReportBurndownChart />
      <ReportTaskBreakdown />
    </div>

    <ReportTaskList />
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useProjectRouteSync } from "@/shared/composables/useProjectRouteSync";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
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

// Report data is already scoped to the currently selected project (see
// useProjectRouteSync above) — no project filter here. Sprint is the only
// filter; still a non-functional mock for now (see
// TASKBOLT-6a5522a58afd1debb24aa01b), wiring it to real sprint data is out
// of scope for this pass.
const mockSprints = ["Sprint 01", "Sprint 02", "QA Sprint"];

const filters = reactive({
  sprintId: "all",
});

const kpiCards = [
  {
    label: t("reports.kpiProgress"),
    value: "75",
    showBar: true,
  },
  {
    label: t("reports.kpiTasksDone"),
    value: "18",
    suffix: "/24",
    sub: t("reports.kpiTasksDoneSub").replace("{{count}}", "6"),
  },
  {
    label: t("reports.kpiStoryPoints"),
    value: "42",
    suffix: "/56",
    sub: t("reports.kpiStoryPointsSub").replace("{{count}}", "14"),
  },
  {
    label: t("reports.kpiTimeLeft"),
    value: "3",
    suffix: t("reports.kpiTimeLeftSuffix"),
    colorClass: "text-amber-600",
    sub: t("reports.kpiTimeLeftSub"),
  },
];
</script>
