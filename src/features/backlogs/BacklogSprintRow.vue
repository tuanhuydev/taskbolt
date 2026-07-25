<template>
  <li class="mb-2">
    <h2 class="px-2 py-1 text-sm font-medium text-muted-foreground">
      {{ sprint ? sprint.name : t("backlogs.backlogBucket") }}
    </h2>
    <ul class="flex flex-col gap-1">
      <TaskGroup
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :sub-tasks="subTaskMap.get(task.id) ?? []"
        :active-task-id="activeTaskId"
        @click="emit('click', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { TaskGroup } from "@/shared/components/ui/task-item";
import type { Task } from "@/shared/types/task";
import type { Sprint } from "@/shared/types/sprint";

defineProps<{
  sprint: Sprint | null;
  tasks: Task[];
  subTaskMap: Map<string, Task[]>;
  activeTaskId: string | null;
}>();

const emit = defineEmits<{
  (e: "click", task: Task): void;
}>();

const { t } = useTaskboltTranslation();
</script>
