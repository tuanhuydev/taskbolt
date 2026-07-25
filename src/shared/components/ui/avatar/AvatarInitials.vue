<script setup lang="ts">
import { computed } from "vue";
import type { HTMLAttributes } from "vue";
import { cn } from "@/shared/lib/utils";
import { getInitials, colorForKey } from "@/shared/lib/avatar";
import Avatar from "./Avatar.vue";
import AvatarFallback from "./AvatarFallback.vue";

interface Props {
  name: string;
  colorKey?: string;
  size?: "sm" | "md";
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  colorKey: undefined,
  class: undefined,
});

const initials = computed(() => getInitials(props.name));
const bgColorClass = computed(() => colorForKey(props.colorKey ?? props.name));
const sizeClass = computed(() => (props.size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs"));
</script>

<template>
  <Avatar :class="cn(sizeClass, props.class)">
    <AvatarFallback :class="bgColorClass">
      {{ initials }}
    </AvatarFallback>
  </Avatar>
</template>
