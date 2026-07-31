<template>
  <div class="rounded-lg border bg-white p-5">
    <div class="flex items-center justify-between mb-1.5">
      <h3 class="text-sm font-bold text-foreground">{{ t("reports.burndownTitle") }}</h3>
      <div class="flex items-center gap-4 text-xs text-muted-foreground">
        <span class="flex items-center gap-1.5">
          <span class="inline-block w-3.5 h-0.5 border-t border-dashed border-slate-300" />
          {{ t("reports.burndownIdeal") }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="inline-block w-3.5 h-0.75 rounded-sm bg-teal-600" />
          {{ t("reports.burndownActual") }}
        </span>
      </div>
    </div>
    <div v-if="totalPoints === 0" class="text-sm text-muted-foreground py-8 text-center">
      {{ t("reports.burndownEmpty") }}
    </div>
    <div v-else ref="containerRef" class="w-full h-48">
      <svg
        :width="width"
        :height="height"
        :viewBox="`0 0 ${width} ${height}`"
        role="img"
        :aria-label="t('reports.burndownTitle')"
      >
        <line
          v-for="tick in yTicks"
          :key="tick"
          :x1="0"
          :x2="width"
          :y1="scaleY(tick)"
          :y2="scaleY(tick)"
          class="stroke-slate-100"
          stroke-width="1"
        />
        <polyline
          :points="idealSvgPoints"
          fill="none"
          class="stroke-slate-300"
          stroke-width="2"
          stroke-dasharray="5 5"
        />
        <polyline
          :points="actualSvgPoints"
          fill="none"
          class="stroke-teal-600"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="point in actual"
          :key="point.label"
          :cx="scaleX(point.position)"
          :cy="scaleY(point.remaining)"
          r="4"
          fill="white"
          class="stroke-teal-600"
          stroke-width="3"
        />
        <text
          v-for="label in xLabels"
          :key="`label-${label.text}`"
          :x="scaleX(label.position)"
          :y="labelY"
          text-anchor="middle"
          class="fill-muted-foreground text-[10px] font-mono"
        >
          {{ label.text }}
        </text>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { useElementSize } from "@/shared/composables/useElementSize";

const { t } = useTaskboltTranslation();

const props = defineProps<{
  totalPoints: number;
  remainingPoints: number;
  startDate: string | null;
  endDate: string | null;
}>();

const containerRef = ref<HTMLElement | null>(null);
const { width, height } = useElementSize(containerRef);

// Real sprint dates/points, but the API has no historical burndown
// snapshots — so "actual" can only ever be two real points (sprint start,
// where nothing was done yet, and today's actual remaining), not a daily
// series. The dashed "ideal" line is the textbook linear projection
// between those same two dates. See TASKBOLT-6a5522a78afd1debb24aa01c.
const todayPosition = computed(() => {
  if (!props.startDate || !props.endDate) return 1;
  const start = new Date(props.startDate).getTime();
  const end = new Date(props.endDate).getTime();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
});

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const startLabel = computed(() => (props.startDate ? formatDate(props.startDate) : t("reports.burndownStart")));
const endLabel = computed(() => (props.endDate ? formatDate(props.endDate) : t("reports.burndownEnd")));

const ideal = computed(() => [
  { position: 0, remaining: props.totalPoints },
  { position: 1, remaining: 0 },
]);
const actual = computed(() => [
  { position: 0, remaining: props.totalPoints, label: startLabel.value },
  {
    position: todayPosition.value,
    remaining: props.remainingPoints,
    label: t("reports.burndownToday"),
  },
]);

// Reserve space below the plot for the label row, and padding on every
// other edge so the end labels (text-anchor="middle") and the point
// circles/stroke at the min/max values aren't clipped by the SVG's own
// boundary.
const labelRowHeight = 22;
const padTop = 8;
const padX = 14;
const plotHeight = computed(() => Math.max(height.value - labelRowHeight - padTop, 1));
const plotWidth = computed(() => Math.max(width.value - padX * 2, 1));
const labelY = computed(() => padTop + plotHeight.value + 16);

function scaleX(position: number): number {
  return padX + position * plotWidth.value;
}

function scaleY(value: number): number {
  const max = props.totalPoints || 1;
  return padTop + plotHeight.value - (value / max) * plotHeight.value;
}

const yTicks = computed(() => [0, props.totalPoints / 2, props.totalPoints]);

const idealSvgPoints = computed(() =>
  ideal.value.map((point) => `${scaleX(point.position)},${scaleY(point.remaining)}`).join(" "),
);
const actualSvgPoints = computed(() =>
  actual.value.map((point) => `${scaleX(point.position)},${scaleY(point.remaining)}`).join(" "),
);

// Distinct x-axis labels: start, today, and the sprint end target — merge
// "today" and "end" when the sprint has already finished so labels don't
// overlap.
const xLabels = computed(() => {
  const labels = [{ position: 0, text: startLabel.value }];
  if (todayPosition.value < 0.98) {
    labels.push({ position: todayPosition.value, text: t("reports.burndownToday") });
  }
  labels.push({ position: 1, text: endLabel.value });
  return labels;
});
</script>
