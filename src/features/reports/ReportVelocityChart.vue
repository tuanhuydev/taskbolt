<template>
  <div class="rounded-lg border bg-card p-4">
    <h3 class="text-sm font-semibold mb-3">{{ t("reports.velocityTitle") }}</h3>
    <svg
      :viewBox="`0 0 ${width} ${totalHeight}`"
      class="w-full h-44"
      preserveAspectRatio="none"
      role="img"
      :aria-label="t('reports.velocityTitle')"
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
      <g v-for="(point, index) in data" :key="point.label">
        <rect
          :x="barX(index)"
          :y="scaleY(point.value)"
          :width="barWidth"
          :height="chartHeight - scaleY(point.value)"
          rx="2"
          class="fill-primary"
        />
        <text
          :x="barX(index) + barWidth / 2"
          :y="chartHeight + 14"
          text-anchor="middle"
          class="fill-muted-foreground text-[9px]"
        >
          {{ point.label }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";

const { t } = useTaskboltTranslation();

// Static placeholder velocity (story points completed per sprint) — see
// TASKBOLT-6a5522a78afd1debb24aa01c. No charting library in the repo yet,
// so this is hand-rolled SVG rather than pulling one in for a mock chart.
const data = [
  { label: "Sprint 20", value: 28 },
  { label: "Sprint 21", value: 34 },
  { label: "Sprint 22", value: 22 },
  { label: "Sprint 23", value: 41 },
  { label: "Sprint 24", value: 37 },
  { label: "Sprint 25", value: 45 },
];

const width = 300;
const chartHeight = 110;
const totalHeight = chartHeight + 20;
const maxValue = Math.max(...data.map((d) => d.value));
const yTicks = [0, maxValue / 2, maxValue];
const barGap = 8;
const barWidth = width / data.length - barGap;

function scaleY(value: number): number {
  return chartHeight - (value / maxValue) * chartHeight;
}

function barX(index: number): number {
  return index * (barWidth + barGap) + barGap / 2;
}
</script>
