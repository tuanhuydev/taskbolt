<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const PRESETS = [1, 2, 3, 5, 8];

const props = defineProps<{
  modelValue?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined];
}>();

const isCustomValue = computed(
  () => props.modelValue !== undefined && !PRESETS.includes(props.modelValue),
);

function selectPreset(value: number) {
  emit("update:modelValue", value);
}

const customValue = computed({
  get: () => (isCustomValue.value ? props.modelValue : ""),
  set: (val: string | number) => {
    emit("update:modelValue", val === "" ? undefined : Number(val));
  },
});
</script>

<template>
  <div class="flex items-center gap-1.5 flex-wrap">
    <Button
      v-for="preset in PRESETS"
      :key="preset"
      type="button"
      size="sm"
      :variant="modelValue === preset ? 'default' : 'outline'"
      class="w-9 font-mono"
      @click="selectPreset(preset)"
    >
      {{ preset }}
    </Button>
    <Input
      v-model="customValue"
      type="number"
      min="0"
      step="1"
      placeholder="Custom"
      class="w-20"
      :class="isCustomValue ? 'border-primary' : ''"
    />
  </div>
</template>
