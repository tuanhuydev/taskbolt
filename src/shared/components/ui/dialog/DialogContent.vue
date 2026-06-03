<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DialogContent, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/shared/lib/utils";
import DialogOverlay from "./DialogOverlay.vue";
import DialogPortal from "./DialogPortal.vue";

const props = defineProps<
  DialogContentProps & { class?: HTMLAttributes["class"] }
>();
const emits = defineEmits<DialogContentEmits>();

const delegatedProps = reactiveOmit(props, "class");
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DialogPortal to="body">
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="forwarded"
      :class="
        cn(
          'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg block overflow-auto',
          props.class,
        )
      "
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
