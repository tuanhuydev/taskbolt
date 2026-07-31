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

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="rounded-lg border bg-card p-4 flex flex-col gap-1"
      >
        <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {{ card.label }}
        </span>
        <span class="text-2xl font-bold font-mono" :class="card.colorClass">
          {{ card.value }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <ReportVelocityChart />
      <ReportBurndownChart />
    </div>
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
import ReportVelocityChart from "./ReportVelocityChart.vue";
import ReportBurndownChart from "./ReportBurndownChart.vue";

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

const statCards = [
  { label: "Total Tasks", value: "128", colorClass: "text-foreground" },
  { label: "Completed", value: "76", colorClass: "text-green-600" },
  { label: "In Progress", value: "31", colorClass: "text-amber-500" },
  { label: "Story Points", value: "214", colorClass: "text-primary" },
];
</script>
