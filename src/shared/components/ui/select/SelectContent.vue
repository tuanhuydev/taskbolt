<script setup lang="ts">
import type { SelectContentEmits, SelectContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed, useSlots } from "vue"
import { SelectContent, SelectPortal, SelectViewport, useForwardPropsEmits } from "reka-ui"
import { reactiveOmit } from "@vueuse/core"
import { cn } from "@/shared/lib/utils"

const props = withDefaults(
  defineProps<SelectContentProps & { class?: HTMLAttributes["class"]; emptyText?: string }>(),
  { position: "popper", emptyText: "No data available", class: undefined },
)
const emits = defineEmits<SelectContentEmits>()

const delegatedProps = reactiveOmit(props, "class", "emptyText")
const forwarded = useForwardPropsEmits(delegatedProps, emits)

const slots = useSlots()
const hasOptions = computed(() => (slots.default?.() ?? []).length > 0)
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="forwarded"
      :class="cn(
        'relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        props.position === 'popper'
          && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        props.class,
      )"
    >
      <SelectViewport
        :class="cn('p-1', props.position === 'popper' && 'h-(--reka-select-trigger-height) w-full min-w-(--reka-select-trigger-width)')"
      >
        <slot v-if="hasOptions" />
        <p v-else class="py-4 text-center text-sm text-muted-foreground">
          {{ props.emptyText }}
        </p>
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
