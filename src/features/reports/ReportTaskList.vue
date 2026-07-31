<template>
  <div class="rounded-lg border bg-white overflow-hidden">
    <div class="flex items-center justify-between px-5 py-3.5 border-b">
      <h3 class="text-sm font-bold text-foreground">{{ t("reports.tasksTitle") }}</h3>
      <Button variant="ghost" size="sm" @click="goToBoard">
        {{ t("reports.viewBoard") }}
      </Button>
    </div>
    <div
      class="hidden sm:grid grid-cols-[84px_1fr_130px_150px_64px] gap-3 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground border-b"
    >
      <span>{{ t("reports.tasksKey") }}</span>
      <span>{{ t("reports.tasksTask") }}</span>
      <span>{{ t("reports.tasksStatus") }}</span>
      <span>{{ t("reports.tasksAssignee") }}</span>
      <span class="text-right">{{ t("reports.tasksPoints") }}</span>
    </div>
    <p v-if="tasks.length === 0" class="px-5 py-6 text-sm text-muted-foreground">
      {{ t("reports.tasksEmpty") }}
    </p>
    <div
      v-for="task in tasks"
      :key="task.key"
      class="grid grid-cols-2 sm:grid-cols-[84px_1fr_130px_150px_64px] gap-2 sm:gap-3 items-center px-5 py-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
    >
      <span class="font-mono text-xs font-medium text-muted-foreground">{{ task.key }}</span>
      <span class="text-sm font-medium text-foreground col-span-2 sm:col-span-1">{{ task.title }}</span>
      <span>
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          :class="statusStyles[task.status].badgeClass"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="statusStyles[task.status].dotClass" />
          {{ t(`taskStatus.${task.status}`) }}
        </span>
      </span>
      <span class="flex items-center gap-2 min-w-0">
        <span
          class="w-6.5 h-6.5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
          :class="task.avatarClass"
        >
          {{ task.initials }}
        </span>
        <span class="text-sm text-foreground truncate">{{ task.assignee }}</span>
      </span>
      <span class="text-right font-mono text-sm font-bold text-foreground">{{ task.points }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { Button } from "@/shared/components/ui/button";
import { TaskStatus } from "@/shared/types/task";

const { t } = useTaskboltTranslation();
const router = useRouter();

function goToBoard() {
  router.push({ name: "active-sprint" });
}

type ListStatus = TaskStatus.TODO | TaskStatus.IN_PROGRESS | TaskStatus.IN_REVIEW | TaskStatus.DONE;

export interface ReportTaskRow {
  key: string;
  title: string;
  status: ListStatus;
  assignee: string;
  initials: string;
  avatarClass: string;
  points: number;
}

defineProps<{
  tasks: ReportTaskRow[];
}>();

const statusStyles: Record<ListStatus, { badgeClass: string; dotClass: string }> = {
  [TaskStatus.TODO]: { badgeClass: "bg-slate-100 text-slate-600", dotClass: "bg-slate-400" },
  [TaskStatus.IN_PROGRESS]: { badgeClass: "bg-blue-50 text-blue-700", dotClass: "bg-blue-500" },
  [TaskStatus.IN_REVIEW]: { badgeClass: "bg-amber-50 text-amber-700", dotClass: "bg-amber-500" },
  [TaskStatus.DONE]: { badgeClass: "bg-teal-50 text-teal-700", dotClass: "bg-teal-600" },
};
</script>
