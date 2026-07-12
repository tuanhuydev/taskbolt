<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/shared/lib/utils";
import { badgeVariants, type BadgeVariants } from ".";

interface Props {
  variant?: BadgeVariants["variant"];
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <span :class="cn(badgeVariants({ variant }), props.class)">
    <slot />
  </span>
</template>
