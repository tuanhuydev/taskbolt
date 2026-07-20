<template>
  <li
    :key="task.id"
    class="rounded-sm"
    :class="{
      'opacity-50': task.status === TaskStatus.DONE || task.status === TaskStatus.CLOSED,
    }"
  >
    <div
      class="flex justify-between transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer text-muted-foreground p-2 rounded-sm"
      @click="subTasks.length ? toggle() : emit('click', task)"
    >
      <div class="flex items-center gap-2.5">
        <TaskTypeIcon :type="task.type" />
        <TaskItemPriority :priority="task.priority ?? TaskPriority.MEDIUM" />
        <h1
          :class="{
            'line-through': task.status === TaskStatus.DONE || task.status === TaskStatus.CLOSED,
            'hover:underline': subTasks.length,
          }"
          @click.stop="emit('click', task)"
        >
          {{ task.title }}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <TaskItemStatus :status="task.status" />
        <Button
          v-if="subTasks.length"
          size="icon"
          variant="ghost"
          class="h-7 w-7 shrink-0 text-muted-foreground"
          @click.stop="toggle"
        >
          <ChevronLeft
            class="h-4 w-4 transition-transform duration-200"
            :class="{ '-rotate-90': open }"
          />
        </Button>
      </div>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="open && subTasks.length" class="pl-4 pb-2">
        <ul class="flex flex-col gap-1 border-l border-border pl-3">
          <TaskItem
            v-for="sub in subTasks"
            :key="sub.id"
            :task="sub"
            @click="emit('click', sub)"
          />
        </ul>
      </div>
    </transition>
  </li>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ChevronLeft } from "lucide-vue-next";
import { Button } from "@/shared/components/ui/button";
import type { Task } from "@/shared/types/task";
import { TaskPriority, TaskStatus } from "@/shared/types/task";
import TaskTypeIcon from "./TaskTypeIcon.vue";
import TaskItemPriority from "./TaskItemPriority.vue";
import TaskItemStatus from "./TaskItemStatus.vue";
import TaskItem from "./TaskItem.vue";

const { task, subTasks, activeTaskId } = defineProps<{
  task: Task;
  subTasks: Task[];
  activeTaskId: string | null;
}>();

const emit = defineEmits<{
  (e: "click", task: Task): void;
}>();

const open = ref(false);

const shouldOpenForActiveTask = computed(() => {
  if (!activeTaskId) return false;

  return (
    activeTaskId === task.id ||
    subTasks.some((subTask) => subTask.id === activeTaskId)
  );
});

watch(
  () => activeTaskId,
  () => {
    open.value = shouldOpenForActiveTask.value;
  },
  { immediate: true },
);

function toggle() {
  open.value = !open.value;
}
</script>
