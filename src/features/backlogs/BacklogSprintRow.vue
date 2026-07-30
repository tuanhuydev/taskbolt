<template>
  <li
    class="mb-2 rounded-md transition-colors"
    :class="{
      'mt-3 border-t border-dashed border-border pt-3': !sprint,
      'ring-2 ring-primary bg-primary/5': isDragOver,
    }"
    @dragover.prevent
    @dragenter.prevent="isDragOver = true"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="flex items-start justify-between gap-3 px-2 py-1.5 rounded-sm">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h2
            class="text-sm font-medium truncate"
            :class="sprint ? 'text-foreground' : 'italic text-muted-foreground/70'"
          >
            {{ sprint ? sprint.name : t("backlogs.backlogBucket") }}
          </h2>
          <span
            v-if="sprint"
            class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            :class="sprintStatusClasses[sprint.status]"
          >
            {{ t(`sprintStatus.${sprint.status}`) }}
          </span>
        </div>
        <div
          v-if="sprint?.goal"
          class="text-sm text-muted-foreground truncate [&_p]:inline"
          v-html="renderMarkdown(sprint.goal)"
        />
        <p
          v-if="sprint && (sprint.startDate || sprint.endDate)"
          class="text-xs text-muted-foreground mt-0.5"
        >
          <span v-if="sprint.startDate">{{ formatDate(sprint.startDate) }}</span>
          <span v-if="sprint.startDate && sprint.endDate"> → </span>
          <span v-if="sprint.endDate">{{ formatDate(sprint.endDate) }}</span>
        </p>
      </div>
    </div>

    <ul class="flex flex-col gap-1 pl-2">
      <TaskGroup
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :sub-tasks="subTaskMap.get(task.id) ?? []"
        :active-task-id="activeTaskId"
        @click="emit('click', $event)"
      />
      <li
        v-if="!sprint && tasks.length === 0"
        class="px-2 py-1 text-sm text-muted-foreground/70"
      >
        {{ t("backlogs.empty") }}
      </li>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { TaskGroup } from "@/shared/components/ui/task-item";
import { formatDate } from "@/shared/lib/helpers";
import { renderMarkdown } from "@/shared/lib/markdown";
import type { Task } from "@/shared/types/task";
import { Sprint, SprintStatus } from "@/shared/types/sprint";

defineProps<{
  sprint: Sprint | null;
  tasks: Task[];
  subTaskMap: Map<string, Task[]>;
  activeTaskId: string | null;
}>();

const emit = defineEmits<{
  (e: "click", task: Task): void;
  (e: "move-to-sprint", taskId: string): void;
}>();

const { t } = useTaskboltTranslation();

const isDragOver = ref(false);

function handleDragLeave(event: DragEvent) {
  const el = event.currentTarget as HTMLElement;
  if (el.contains(event.relatedTarget as Node | null)) return;
  isDragOver.value = false;
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false;
  const taskId = event.dataTransfer?.getData("text/plain");
  if (taskId) emit("move-to-sprint", taskId);
}

const sprintStatusClasses: Record<SprintStatus, string> = {
  [SprintStatus.PLANNED]: "bg-gray-100 text-gray-600",
  [SprintStatus.ACTIVE]: "bg-green-100 text-green-700",
  [SprintStatus.COMPLETED]: "bg-blue-100 text-blue-700",
};
</script>
