<template>
  <img
    :src="getPriorityIcon(priority)"
    :alt="priority + ' priority icon'"
    class="w-5 h-5"
  />
</template>

<script setup lang="ts">
import highestSrc from "@/assets/icons/highest_priority.svg";
import highSrc from "@/assets/icons/high_priority.svg";
import mediumSrc from "@/assets/icons/medium_priority.svg";
import lowSrc from "@/assets/icons/low_priority.svg";
import { TaskPriority } from "@/shared/types/task";

const props = defineProps<{ priority: TaskPriority }>();

function getPriorityIcon(priority: TaskPriority) {
  switch (priority) {
    case TaskPriority.HIGHEST:
      return highestSrc;
    case TaskPriority.HIGH:
      return highSrc;
    case TaskPriority.MEDIUM:
      return mediumSrc;
    case TaskPriority.LOW:
      return lowSrc;
    default:
      return mediumSrc;
  }
}
</script>
