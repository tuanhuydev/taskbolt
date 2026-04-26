<template>
  <li
    class="flex justify-between transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer text-muted-foreground p-2 rounded-sm"
    :key="task.id"
    @click="emit('click', task)"
  >
    <div class="flex items-center gap-2.5">
      <TaskTypeIcon :type="task.type" />
      <TaskItemPriority :priority="task.priority ?? TaskPriority.MEDIUM" />
      <h1>{{ task.title }}</h1>
    </div>
    <EllipsisVertical :size="16" class="text-muted-foreground" />
  </li>
</template>
<script setup lang="ts">
import { Task, TaskPriority } from "@/shared/types/task";
import TaskTypeIcon from "./TaskTypeIcon.vue";
import TaskItemPriority from "./TaskItemPriority.vue";
import { EllipsisVertical } from "lucide-vue-next";

const { task } = defineProps<{ task: Task }>();
const emit = defineEmits<{
  (e: 'click', task: Task): void;
}>();
</script>
