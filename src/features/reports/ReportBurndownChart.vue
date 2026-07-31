<template>
  <div class="rounded-lg border bg-card shadow-sm p-5">
    <div class="flex items-center justify-between mb-1.5">
      <h3 class="text-sm font-bold text-foreground">{{ t("reports.burndownTitle") }}</h3>
      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <span class="flex items-center gap-1.5">
          <span class="inline-block w-3.5 h-0.5 border-t border-dashed border-slate-300" />
          {{ t("reports.burndownIdeal") }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block w-3.5 h-[3px] rounded-sm bg-teal-600" />
          {{ t("reports.burndownActual") }}
        </span>
      </div>
    </div>
    <svg
      :viewBox="`0 0 ${width} ${totalHeight}`"
      class="w-full h-48"
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
        class="stroke-slate-100"
        stroke-width="1"
      />
      <polyline
        :points="idealPoints"
        fill="none"
        class="stroke-slate-300"
        stroke-width="2"
        stroke-dasharray="5 5"
      />
      <polyline
        :points="actualPoints"
        fill="none"
        class="stroke-teal-600"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle
        v-for="(point, index) in actual"
        :key="point.week"
        :cx="scaleX(index)"
        :cy="scaleY(point.remaining)"
        r="4"
        fill="white"
        class="stroke-teal-600"
        stroke-width="3"
      />
      <text
        v-for="(point, index) in actual"
        :key="`label-${point.week}`"
        :x="scaleX(index)"
        :y="chartHeight + 16"
        text-anchor="middle"
        class="fill-muted-foreground text-[10px] font-mono"
      >
        {{ point.week }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";

const { t } = useTaskboltTranslation();

// Static placeholder burndown (remaining story points per sprint week) —
// see TASKBOLT-6a5522a78afd1debb24aa01c. Hand-rolled SVG, no charting
// library in the repo yet.
const totalPoints = 56;
const actual = [
  { week: "W1", remaining: 56 },
  { week: "W1.5", remaining: 44 },
  { week: "W2", remaining: 35 },
  { week: "W2.5", remaining: 20 },
  { week: "W3", remaining: 8 },
  { week: "W3.5", remaining: 0 },
  { week: "W4", remaining: 0 },
];
const ideal = actual.map((point, index) => ({
  week: point.week,
  remaining: totalPoints - (totalPoints / (actual.length - 1)) * index,
}));

const width = 300;
const chartHeight = 110;
const totalHeight = chartHeight + 22;

function scaleX(index: number): number {
  return (index / (actual.length - 1)) * width;
}

function scaleY(value: number): number {
  return chartHeight - (value / totalPoints) * chartHeight;
}

const yTicks = [0, totalPoints / 2, totalPoints];

const actualPoints = actual
  .map((point, index) => `${scaleX(index)},${scaleY(point.remaining)}`)
  .join(" ");
const idealPoints = ideal
  .map((point, index) => `${scaleX(index)},${scaleY(point.remaining)}`)
  .join(" ");
</script>
