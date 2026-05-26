<template>
  <li
    :key="task.id"
    class="flex justify-between transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer text-muted-foreground p-2 rounded-sm"
    :class="{ 'opacity-50': task.status === TaskStatus.DONE }"
    @click="emit('click', task)"
  >
    <div class="flex items-center gap-2.5">
      <TaskTypeIcon :type="task.type" />
      <TaskItemPriority :priority="task.priority ?? TaskPriority.MEDIUM" />
      <h1 :class="{ 'line-through': task.status === TaskStatus.DONE }">
        {{ task.title }}
      </h1>
    </div>
    <div class="flex items-center gap-2">
      <TaskItemStatus :status="task.status" />
      <EllipsisVertical :size="16" class="text-muted-foreground" />
    </div>
  </li>
</template>
<script setup lang="ts">
import { Task, TaskPriority, TaskStatus } from "@/shared/types/task";
import TaskTypeIcon from "./TaskTypeIcon.vue";
import TaskItemPriority from "./TaskItemPriority.vue";
import TaskItemStatus from "./TaskItemStatus.vue";
import { EllipsisVertical } from "lucide-vue-next";

const { task } = defineProps<{ task: Task }>();
const emit = defineEmits<{
  (e: "click", task: Task): void;
}>();
</script>
