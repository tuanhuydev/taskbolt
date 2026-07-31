<template>
  <div class="rounded-lg border bg-card shadow-sm p-5">
    <h3 class="text-sm font-bold text-foreground mb-4">
      {{ t("reports.breakdownTitle") }}
    </h3>
    <div class="flex h-2.5 rounded-full overflow-hidden mb-4.5">
      <div
        v-for="row in rows"
        :key="row.status"
        :class="row.barClass"
        :style="{ width: row.percent + '%' }"
      />
    </div>
    <div class="flex flex-col gap-3">
      <div
        v-for="row in rows"
        :key="row.status"
        class="flex items-center justify-between text-sm"
      >
        <span class="flex items-center gap-2.5 text-foreground">
          <span class="w-2.25 h-2.25 rounded-sm" :class="row.dotClass" />
          {{ t(`taskStatus.${row.status}`) }}
        </span>
        <span class="font-mono font-bold text-foreground">{{ row.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { TaskStatus } from "@/shared/types/task";

const { t } = useTaskboltTranslation();

// Static placeholder breakdown — see TASKBOLT-6a5522a98afd1debb24aa01d.
// Counts are arbitrary mock data, not derived from any real task list.
const counts = {
  [TaskStatus.TODO]: 6,
  [TaskStatus.IN_PROGRESS]: 4,
  [TaskStatus.IN_REVIEW]: 2,
  [TaskStatus.DONE]: 12,
};

const styles: Record<string, { barClass: string; dotClass: string }> = {
  [TaskStatus.TODO]: { barClass: "bg-slate-300", dotClass: "bg-slate-300" },
  [TaskStatus.IN_PROGRESS]: { barClass: "bg-blue-500", dotClass: "bg-blue-500" },
  [TaskStatus.IN_REVIEW]: { barClass: "bg-amber-500", dotClass: "bg-amber-500" },
  [TaskStatus.DONE]: { barClass: "bg-teal-600", dotClass: "bg-teal-600" },
};

const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

const rows = (Object.keys(counts) as (keyof typeof counts)[]).map((status) => ({
  status,
  count: counts[status],
  percent: total ? (counts[status] / total) * 100 : 0,
  ...styles[status],
}));
</script>
