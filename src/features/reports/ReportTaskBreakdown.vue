<template>
  <div class="rounded-lg border bg-white p-5">
    <h3 class="text-sm font-bold text-foreground mb-4">
      {{ t("reports.breakdownTitle") }}
    </h3>
    <div v-if="total === 0" class="text-sm text-muted-foreground">
      {{ t("reports.breakdownEmpty") }}
    </div>
    <template v-else>
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { TaskStatus } from "@/shared/types/task";

const { t } = useTaskboltTranslation();

type BreakdownStatus =
  | TaskStatus.TODO
  | TaskStatus.IN_PROGRESS
  | TaskStatus.IN_REVIEW
  | TaskStatus.DONE;

const props = defineProps<{
  counts: Record<BreakdownStatus, number>;
}>();

const styles: Record<BreakdownStatus, { barClass: string; dotClass: string }> = {
  [TaskStatus.TODO]: { barClass: "bg-slate-300", dotClass: "bg-slate-300" },
  [TaskStatus.IN_PROGRESS]: { barClass: "bg-blue-500", dotClass: "bg-blue-500" },
  [TaskStatus.IN_REVIEW]: { barClass: "bg-amber-500", dotClass: "bg-amber-500" },
  [TaskStatus.DONE]: { barClass: "bg-teal-600", dotClass: "bg-teal-600" },
};

const statusOrder: BreakdownStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

const total = computed(() =>
  statusOrder.reduce((sum, status) => sum + (props.counts[status] ?? 0), 0),
);

const rows = computed(() =>
  statusOrder.map((status) => {
    const count = props.counts[status] ?? 0;
    return {
      status,
      count,
      percent: total.value ? (count / total.value) * 100 : 0,
      ...styles[status],
    };
  }),
);
</script>
