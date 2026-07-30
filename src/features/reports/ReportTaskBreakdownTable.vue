<template>
  <div class="rounded-lg border bg-card p-4">
    <h3 class="text-sm font-semibold mb-3">{{ t("reports.breakdownTitle") }}</h3>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div v-for="group in groups" :key="group.title">
        <h4 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          {{ group.title }}
        </h4>
        <table class="w-full text-sm">
          <tbody>
            <tr v-for="row in group.rows" :key="row.label" class="border-t first:border-t-0">
              <td class="py-1.5 pr-2 text-foreground">{{ row.label }}</td>
              <td class="py-1.5 pr-2 text-right font-mono text-muted-foreground">
                {{ row.count }}
              </td>
              <td class="py-1.5 w-16">
                <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-primary"
                    :style="{ width: row.percent + '%' }"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { TaskStatus, TaskType, TaskPriority } from "@/shared/types/task";

const { t } = useTaskboltTranslation();

// Static placeholder breakdown — see TASKBOLT-6a5522a98afd1debb24aa01d.
// Counts are arbitrary mock data, not derived from any real task list.
function toRows(counts: Record<string, number>, labelFn: (key: string) => string) {
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  return Object.entries(counts).map(([key, count]) => ({
    label: labelFn(key),
    count,
    percent: total ? Math.round((count / total) * 100) : 0,
  }));
}

const statusCounts: Record<TaskStatus, number> = {
  [TaskStatus.TODO]: 34,
  [TaskStatus.IN_PROGRESS]: 21,
  [TaskStatus.IN_REVIEW]: 10,
  [TaskStatus.DONE]: 76,
  [TaskStatus.CLOSED]: 7,
};

const typeCounts: Record<TaskType, number> = {
  [TaskType.STORY]: 42,
  [TaskType.EPIC]: 6,
  [TaskType.ISSUE]: 58,
  [TaskType.BUG]: 22,
};

const priorityCounts: Record<TaskPriority, number> = {
  [TaskPriority.HIGHEST]: 9,
  [TaskPriority.HIGH]: 27,
  [TaskPriority.MEDIUM]: 61,
  [TaskPriority.LOW]: 31,
};

const groups = [
  {
    title: t("reports.breakdownByStatus"),
    rows: toRows(statusCounts, (key) => t(`taskStatus.${key}`)),
  },
  {
    title: t("reports.breakdownByType"),
    rows: toRows(typeCounts, (key) => t(`taskType.${key}`)),
  },
  {
    title: t("reports.breakdownByPriority"),
    rows: toRows(priorityCounts, (key) => t(`taskPriority.${key}`)),
  },
];
</script>
