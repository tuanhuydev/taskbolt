<template>
  <div class="rounded-lg border bg-card p-4">
    <h3 class="text-sm font-semibold mb-3">{{ t("reports.burndownTitle") }}</h3>
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full h-40"
      preserveAspectRatio="none"
      role="img"
      :aria-label="t('reports.burndownTitle')"
    >
      <line
        v-for="tick in yTicks"
        :key="tick"
        x1="0"
        :x2="width"
        :y1="scaleY(tick)"
        :y2="scaleY(tick)"
        class="stroke-border"
        stroke-width="1"
      />
      <polyline
        :points="idealPoints"
        fill="none"
        class="stroke-muted-foreground"
        stroke-width="1.5"
        stroke-dasharray="4 3"
      />
      <polyline
        :points="actualPoints"
        fill="none"
        class="stroke-primary"
        stroke-width="2"
      />
      <circle
        v-for="(point, index) in actual"
        :key="point.day"
        :cx="scaleX(index)"
        :cy="scaleY(point.remaining)"
        r="2.5"
        class="fill-primary"
      />
    </svg>
    <div class="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-0.5 bg-primary" />
        {{ t("reports.burndownActual") }}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-0.5 border-t border-dashed border-muted-foreground" />
        {{ t("reports.burndownIdeal") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";

const { t } = useTaskboltTranslation();

// Static placeholder burndown (remaining story points per sprint day) — see
// TASKBOLT-6a5522a78afd1debb24aa01c. Hand-rolled SVG, no charting library
// in the repo yet.
const totalPoints = 45;
const sprintDays = 10;
const actual = [
  { day: 0, remaining: 45 },
  { day: 1, remaining: 42 },
  { day: 2, remaining: 40 },
  { day: 3, remaining: 34 },
  { day: 4, remaining: 30 },
  { day: 5, remaining: 27 },
  { day: 6, remaining: 21 },
  { day: 7, remaining: 15 },
  { day: 8, remaining: 9 },
  { day: 9, remaining: 3 },
];
const ideal = Array.from({ length: sprintDays }, (_, day) => ({
  day,
  remaining: totalPoints - (totalPoints / (sprintDays - 1)) * day,
}));

const width = 300;
const height = 120;

function scaleX(index: number): number {
  return (index / (sprintDays - 1)) * width;
}

function scaleY(value: number): number {
  return height - (value / totalPoints) * height;
}

const yTicks = [0, totalPoints / 2, totalPoints];

const actualPoints = actual
  .map((point, index) => `${scaleX(index)},${scaleY(point.remaining)}`)
  .join(" ");
const idealPoints = ideal
  .map((point, index) => `${scaleX(index)},${scaleY(point.remaining)}`)
  .join(" ");
</script>
