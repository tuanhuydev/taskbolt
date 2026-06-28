<template>
  <div class="relative rounded-xl bg-slate-900 p-7 flex flex-col justify-between min-h-40 overflow-hidden">
    <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 80% 20%, rgba(11,138,123,.28) 0%, transparent 65%)"></div>

    <div class="relative">
      <div class="text-[11px] font-bold uppercase tracking-[.08em] text-white/45 mb-2">{{ dateLabel }}</div>
      <h1 class="m-0 text-[26px] font-extrabold leading-tight tracking-tight text-white">
        {{ greeting }},<br />{{ userName }}
      </h1>
    </div>

    <div class="relative flex items-center flex-wrap gap-2.5 mt-5">
      <span v-if="sprint" class="inline-flex items-center gap-1.5 h-6.5 px-2.5 rounded-full bg-white/10 text-white/70 text-[12px] font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 flex-none"></span>
        {{ sprint.name }} · {{ daysLeft }} days left
      </span>
      <span class="inline-flex items-center gap-1.5 h-6.5 px-2.5 rounded-full bg-white/10 text-white/70 text-[12px] font-semibold">
        {{ myTaskCount }} tasks assigned to you
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/configs/store';
import type { Sprint } from '@/shared/types/sprint';

const props = defineProps<{
  sprint: Sprint | null;
  myTaskCount: number;
}>();

const { user } = useUserStore();

const now = new Date();
const hours = now.getHours();

const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const greeting = computed(() => {
  if (hours < 12) return 'Good morning';
  if (hours < 17) return 'Good afternoon';
  return 'Good evening';
});

const userName = computed(() => user?.name ?? 'there');

const daysLeft = computed(() => {
  if (!props.sprint?.endDate) return 0;
  const end = new Date(props.sprint.endDate);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});
</script>
