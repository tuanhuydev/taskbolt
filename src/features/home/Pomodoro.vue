<template>
  <div class="bg-white border border-border rounded-xl shadow-sm p-4 flex flex-col items-center gap-2.5">
    <div class="w-full flex items-center justify-between">
      <span class="font-bold text-[12.5px] text-foreground">Pomodoro</span>
      <div class="flex gap-1.5">
        <button
          @click="startTimer"
          class="w-7 h-7 flex items-center justify-center border border-border rounded-lg cursor-pointer transition-colors"
          :class="isRunning ? 'bg-foreground text-background' : 'bg-white text-foreground'"
        >
          <svg v-if="isRunning" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </button>
        <button
          @click="resetTimer"
          class="w-7 h-7 flex items-center justify-center border border-border bg-white text-foreground rounded-lg cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>
    </div>

    <svg viewBox="0 0 136 136" class="w-34 h-34">
      <circle cx="68" cy="68" r="52" fill="none" stroke="hsl(210 40% 96%)" stroke-width="9"/>
      <circle
        cx="68" cy="68" r="52"
        fill="none"
        stroke="hsl(var(--primary))"
        stroke-width="9"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 68 68)"
        style="transition: stroke-dashoffset 1s linear"
      />
      <text
        x="68" y="68"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="26"
        font-weight="800"
        fill="hsl(var(--foreground))"
        letter-spacing="-0.02em"
        font-family="ui-monospace, monospace"
      >{{ formattedTime }}</text>
    </svg>

    <div class="flex gap-1.5">
      <button
        v-for="mode in MODES"
        :key="mode.key"
        @click="setMode(mode.key)"
        class="h-6 px-2.5 rounded-full border text-[10.5px] font-semibold cursor-pointer transition-colors"
        :class="currentMode === mode.key
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-transparent text-muted-foreground'"
      >
        {{ mode.label }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onUnmounted } from 'vue';

const MODES = [
  { key: 'focus' as const, label: 'Focus', duration: 25 * 60 },
  { key: 'short' as const, label: 'Short', duration: 5 * 60 },
  { key: 'long' as const, label: 'Long', duration: 15 * 60 },
];

type ModeKey = typeof MODES[number]['key'];

const currentMode = ref<ModeKey>('focus');
const totalTime = computed(() => MODES.find(m => m.key === currentMode.value)!.duration);
const pomodoroTime = ref(totalTime.value);
const isRunning = ref(false);

const R = 52;
const circumference = 2 * Math.PI * R;
const dashOffset = computed(() => circumference * (1 - pomodoroTime.value / totalTime.value));

const formattedTime = computed(() => {
  const m = Math.floor(pomodoroTime.value / 60);
  const s = pomodoroTime.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

let timer: ReturnType<typeof setInterval> | null = null;

function startTimer() {
  if (isRunning.value) {
    if (timer) clearInterval(timer);
  } else {
    timer = setInterval(() => {
      if (pomodoroTime.value > 0) {
        pomodoroTime.value--;
      } else {
        if (timer) clearInterval(timer);
        isRunning.value = false;
      }
    }, 1000);
  }
  isRunning.value = !isRunning.value;
}

function resetTimer() {
  if (timer) clearInterval(timer);
  pomodoroTime.value = totalTime.value;
  isRunning.value = false;
}

function setMode(key: ModeKey) {
  if (timer) clearInterval(timer);
  currentMode.value = key;
  pomodoroTime.value = MODES.find(m => m.key === key)!.duration;
  isRunning.value = false;
}

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
