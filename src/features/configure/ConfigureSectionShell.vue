<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div class="space-y-1">
        <h2 class="text-2xl font-semibold">{{ t(titleKey) }}</h2>
        <p v-if="descriptionKey" class="text-sm text-muted-foreground">{{ t(descriptionKey) }}</p>
      </div>
      <div class="w-full sm:w-auto">
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
