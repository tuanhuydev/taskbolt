<script setup lang="ts">
import type { ProgressRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { ProgressRoot, ProgressIndicator, useForwardProps } from "reka-ui";
import { reactiveOmit } from "@vueuse/core";
import { computed } from "vue";
import { cn } from "@/shared/lib/utils";

const props = defineProps<ProgressRootProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);

const max = computed(() => props.max ?? 100);
const percent = computed(() => {
  const value = props.modelValue ?? 0;
  return Math.min(100, Math.max(0, (Number(value) / max.value) * 100));
});
</script>

<template>
  <ProgressRoot
    v-bind="forwardedProps"
    :class="cn('relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100', props.class)"
  >
    <ProgressIndicator
      class="h-full w-full flex-1 rounded-full bg-primary transition-all duration-300 ease-out"
      :style="{ transform: `translateX(-${100 - percent}%)` }"
    />
  </ProgressRoot>
</template>
