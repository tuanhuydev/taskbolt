<template>
  <div class="border border-border rounded-sm mb-2">
    <div
      class="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-card text-card-foreground"
      @click="toggle"
    >
      <div>
        <span class="font-medium">{{ task.title }}</span>
        <span v-if="task.status" class="ml-2 text-xs text-muted-foreground">
          {{ task.status }}
        </span>
      </div>
      <span>
        <svg v-if="open" class="w-4 h-4" viewBox="0 0 20 20">
          <path d="M5 12l5-5 5 5" />
        </svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 20 20">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </span>
    </div>
    <div v-if="open && subTasks.length" class="pl-8 pr-4 pb-3">
      <ul class="flex flex-col gap-2">
        <li
          v-for="sub in subTasks"
          :key="sub.id"
          class="border border-border rounded px-3 py-2 bg-muted"
        >
          <span class="font-medium">{{ sub.title }}</span>
          <span v-if="sub.status" class="ml-2 text-xs text-muted-foreground">{{
            sub.status
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "@/shared/types/task";

const props = defineProps<{
  task: Task;
  subTasks: Task[];
}>();

const open = ref(false);
function toggle() {
  open.value = !open.value;
}
</script>
