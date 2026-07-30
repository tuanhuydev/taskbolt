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
          {{ t("reports.filterProject") }}
        </label>
        <Select v-model="filters.projectId">
          <SelectTrigger>
            <SelectValue :placeholder="t('reports.filterProjectAll')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{{ t("reports.filterProjectAll") }}</SelectItem>
            <SelectItem v-for="project in mockProjects" :key="project" :value="project">
              {{ project }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      <div>
        <label class="text-xs font-medium text-muted-foreground block mb-1.5">
          {{ t("reports.filterDateRange") }}
        </label>
        <div class="flex items-center gap-2">
          <Input v-model="filters.startDate" type="date" class="w-38" />
          <span class="text-muted-foreground text-sm">→</span>
          <Input v-model="filters.endDate" type="date" class="w-38" />
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useProjectRouteSync } from "@/shared/composables/useProjectRouteSync";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";

useProjectRouteSync();

const { t } = useTaskboltTranslation();

// Static placeholders — the filter row is a non-functional mock shell for
// now (see TASKBOLT-6a5522a58afd1debb24aa01b); wiring to real project/
// sprint/date data is out of scope for this pass.
const mockProjects = ["Taskbolt", "Budtr", "Flowrk"];
const mockSprints = ["Sprint 01", "Sprint 02", "QA Sprint"];

const filters = reactive({
  projectId: "all",
  sprintId: "all",
  startDate: "",
  endDate: "",
});

const statCards = [
  { label: "Total Tasks", value: "128", colorClass: "text-foreground" },
  { label: "Completed", value: "76", colorClass: "text-green-600" },
  { label: "In Progress", value: "31", colorClass: "text-amber-500" },
  { label: "Story Points", value: "214", colorClass: "text-primary" },
];
</script>
