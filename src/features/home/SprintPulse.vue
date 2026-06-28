<template>
  <div class="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col gap-3.5">
    <div class="flex items-center justify-between">
      <span class="font-bold text-[13px] text-foreground">{{ sprint ? sprint.name + ' pulse' : 'Sprint pulse' }}</span>
      <button @click="goToSprint" class="text-[12px] font-semibold text-primary hover:opacity-70 transition-opacity">
        View board →
      </button>
    </div>

    <div v-if="loading" class="grid grid-cols-2 gap-2.5">
      <div v-for="i in 4" :key="i" class="bg-slate-50 rounded-lg p-3 h-[70px] animate-pulse"></div>
    </div>
    <div v-else class="grid grid-cols-2 gap-2.5">
      <div v-for="stat in stats" :key="stat.label" class="bg-slate-50 rounded-lg p-3 flex flex-col gap-1">
        <span class="text-[11px] font-bold uppercase tracking-[.05em] text-muted-foreground">{{ stat.label }}</span>
        <span class="text-[20px] font-extrabold font-mono leading-none" :class="stat.colorClass">{{ stat.value }}</span>
        <span class="text-[11px] text-muted-foreground">{{ stat.sub }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <div class="flex justify-between text-[11.5px] text-muted-foreground">
        <span>Progress</span>
        <span class="font-bold text-primary">{{ progressPct }}%</span>
      </div>
      <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-300"
          :style="{ width: progressPct + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Sprint } from '@/shared/types/sprint';
import { type Task, TaskStatus } from '@/shared/types/task';

const props = defineProps<{
  sprint: Sprint | null;
  tasks: Task[];
  loading: boolean;
}>();

const router = useRouter();

function goToSprint() {
  router.push({ name: 'active-sprint' });
}

const todoCount = computed(() => props.tasks.filter(t => t.status === TaskStatus.TODO).length);
const inProgressCount = computed(() => props.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length);
const doneCount = computed(() => props.tasks.filter(t => t.status === TaskStatus.DONE).length);

const daysLeft = computed(() => {
  if (!props.sprint?.endDate) return 0;
  const end = new Date(props.sprint.endDate);
  const diff = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

const endLabel = computed(() => {
  if (!props.sprint?.endDate) return '—';
  return new Date(props.sprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
});

const stats = computed(() => [
  { label: 'To do',       value: String(todoCount.value),       sub: 'tasks pending',   colorClass: 'text-foreground' },
  { label: 'In progress', value: String(inProgressCount.value), sub: 'being worked on', colorClass: 'text-primary' },
  { label: 'Done',        value: String(doneCount.value),       sub: 'shipped ✓',       colorClass: 'text-green-600' },
  { label: 'Days left',   value: String(daysLeft.value),        sub: endLabel.value + ' deadline', colorClass: 'text-amber-600' },
]);

const progressPct = computed(() => {
  const total = props.tasks.length;
  if (!total) return 0;
  return Math.round((doneCount.value / total) * 100);
});
</script>
