<script setup lang="ts">
import type { AvatarFallbackProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { AvatarFallback, useForwardProps } from "reka-ui";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/shared/lib/utils";

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AvatarFallback
    v-bind="forwardedProps"
    :class="cn('flex h-full w-full items-center justify-center rounded-full bg-slate-400 text-white font-bold', props.class)"
  >
    <slot />
  </AvatarFallback>
</template>
