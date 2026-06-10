<template>
  <div class="w-5 h-5 flex justify-center items-center">
    <span
      class="inline-block w-3 h-3 rounded-full shrink-0"
      :style="{ backgroundColor: getStatusColor(status) }"
      :aria-label="status"
    />
  </div>
</template>

<script setup lang="ts">
import { TaskStatus } from "@/shared/types/task";

const props = defineProps<{ status: TaskStatus }>();

function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return "#78909C";
    case TaskStatus.IN_PROGRESS:
      return "#FFD600";
    case TaskStatus.DONE:
      return "#00C853";
    default:
      return "#78909C";
  }
}
</script>
