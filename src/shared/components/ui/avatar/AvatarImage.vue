<script setup lang="ts">
import type { AvatarImageProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { AvatarImage, useForwardProps } from "reka-ui";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/shared/lib/utils";

const props = defineProps<AvatarImageProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <AvatarImage
    v-bind="forwardedProps"
    :class="cn('h-full w-full object-cover', props.class)"
  />
</template>
