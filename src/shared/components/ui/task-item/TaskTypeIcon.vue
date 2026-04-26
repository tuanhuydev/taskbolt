<template>
  <img :src="getIcon(type)" :alt="type + ' icon'" class="w-5 h-5" />
</template>

<script setup lang="ts">
import epicSrc from "@/assets/icons/epic.svg";
import storySrc from "@/assets/icons/story.svg";
import issueSrc from "@/assets/icons/issue.svg";
import bugSrc from "@/assets/icons/bug.svg";
import { TaskType } from "@/shared/types/task";

const props = defineProps<{ type: TaskType }>();

function getIcon(type: TaskType) {
  switch (type) {
    case TaskType.EPIC:
      return epicSrc;
    case TaskType.STORY:
      return storySrc;
    case TaskType.BUG:
      return bugSrc;
    case TaskType.ISSUE:
    default:
      return issueSrc;
  }
}
</script>
