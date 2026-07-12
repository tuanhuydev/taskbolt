<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { CheckboxRoot, CheckboxIndicator, useForwardPropsEmits } from "reka-ui";
import { reactiveOmit } from "@vueuse/core";
import { Check } from "lucide-vue-next";
import { cn } from "@/shared/lib/utils";

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="cn(
      'peer h-4.5 w-4.5 shrink-0 rounded-sm border-2 border-input flex items-center justify-center transition-colors',
      'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      props.class,
    )"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <Check class="h-3 w-3" stroke-width="3" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
