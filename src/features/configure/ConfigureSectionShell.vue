<template>
  <section class="space-y-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div class="space-y-1">
        <div
          v-if="$slots.eyebrow"
          class="flex items-center gap-2 text-xs font-semibold text-muted-foreground"
        >
          <slot name="eyebrow" />
        </div>
        <h2 class="text-2xl font-extrabold tracking-tight">{{ t(titleKey) }}</h2>
        <p v-if="descriptionKey" class="text-sm text-muted-foreground">{{ t(descriptionKey) }}</p>
      </div>
      <div class="shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <slot />
  </section>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';

const props = defineProps<{
  titleKey: string;
  descriptionKey?: string;
}>();

const { t } = useTaskboltTranslation();

const titleKey = props.titleKey;
const descriptionKey = props.descriptionKey;
</script>
