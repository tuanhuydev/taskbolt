<script setup lang="ts">
import type { AvatarRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { AvatarRoot, useForwardProps } from "reka-ui";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/shared/lib/utils";

const props = defineProps<AvatarRootProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AvatarRoot
    v-bind="forwardedProps"
    :class="cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full', props.class)"
  >
    <slot />
  </AvatarRoot>
</template>
