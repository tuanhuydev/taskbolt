<script lang="ts" setup>
import type { HTMLAttributes } from "vue";
import { cn } from "@/shared/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div
    data-slot="drawer-footer"
    :class="cn('flex flex-col gap-2 p-4 shrink-0', props.class)"
  >
    <slot />
  </div>
</template>
