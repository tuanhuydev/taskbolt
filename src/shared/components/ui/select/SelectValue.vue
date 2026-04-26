<script setup lang="ts">
import type { SelectValueProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { SelectValue, useForwardProps } from "reka-ui"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "@/shared/lib/utils"

const props = defineProps<SelectValueProps & { class?: HTMLAttributes["class"]; placeholder?: string }>()

const delegatedProps = reactiveOmit(props, "class")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectValue
    v-bind="forwardedProps"
    :class="cn('text-sm', props.class)"
    :placeholder="placeholder"
  >
    <slot />
  </SelectValue>
</template>
