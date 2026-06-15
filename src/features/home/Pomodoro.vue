<script lang="ts" setup>
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import { Button } from "@/shared/components/ui/button";
import { computed, ref } from 'vue';
import { CirclePause, Square, RotateCcw } from 'lucide-vue-next';

const { t } = useTaskboltTranslation();
const totalTime = 25 * 60; // 25 minutes in seconds
const pomodoroTime = ref<number>(totalTime);
const isRunning = ref<boolean>(false);

// Calculate how many ticks should be colored based on remaining time
const currentProgress = computed(() => {
    const percentage = pomodoroTime.value / totalTime;
    return Math.floor(percentage * 12);
});

// Cleanly format the remaining time for the template
const formattedTime = computed(() => {
    const minutes = Math.floor(pomodoroTime.value / 60);
    const seconds = pomodoroTime.value % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
});

let timer: ReturnType<typeof setInterval> | null = null;

const startTimer = () => {
    if (isRunning.value) {
        if (timer) clearInterval(timer);
    } else {
        timer = setInterval(() => {
            if (pomodoroTime.value > 0) {
                pomodoroTime.value--;
            } else {
                if (timer) clearInterval(timer);
                alert('Pomodoro session completed!');
                isRunning.value = false;
            }
        }, 1000);
    }
    isRunning.value = !isRunning.value;
};

const resetTimer = () => {
    if (timer) clearInterval(timer);
    pomodoroTime.value = totalTime;
    isRunning.value = false;
};
</script>

<template>
    <div class="widget p-4 bg-white rounded-lg shadow w-90 h-80 flex flex-col items-center gap-1">
        <div class="w-full flex items-center justify-between">
            <h2 class="text-lg font-medium">{{ t("widgets.pomodoro.title") }}</h2>
            <div class="flex gap-4">
                <Button @click="startTimer">
                    <CirclePause v-if="isRunning" />
                    <Square v-else />
                </Button>
                <Button variant="outline" @click="resetTimer">
                    <RotateCcw />
                </Button>
            </div>
        </div>
        
        <div class="flex flex-col items-center justify-center flex-1 relative mb-3 w-full">
            <div class="relative size-56.25">
                <span 
                    v-for="i in 12" 
                    :key="i" 
                    class="tick bg-slate-200 border border-slate-300" 
                    :class="{ 'bg-primary!': i <= currentProgress }"
                    :style="{ '--index': i }" 
                />
            </div>
            <!-- Fixed: Moved formatting logic to the script setup -->
            <h2 class="text-5xl font-semibold m-0 p-0 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {{ formattedTime }}
            </h2>
        </div>
    </div>
</template>

<style scoped>
.tick {
    --width: 115px;
    --paddingTop: 1px;
    --translateY: calc(var(--width) - var(--paddingTop));

    position: absolute;
    top: 35%;
    left: 50%;
    border-radius: 10px;
    width: 16px;
    height: 36px;
    transform-origin: bottom center;

    transform: translateX(-50%) rotate(calc(var(--index) * 30deg)) translateY(var(--translateY));
    transition: background-color 0.3s ease;
}

.tick-active {
    background-color: var(--primary);
    box-shadow: none;
}

.timer-display {
    font-size: 2.5rem;
    font-weight: bold;
    color: #ffffff;
    z-index: 10;
}
</style>