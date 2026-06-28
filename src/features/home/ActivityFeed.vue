<template>
  <div class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
    <div class="px-5 py-4 border-b border-border">
      <span class="font-bold text-[14px] text-foreground">Team activity</span>
    </div>
    <div class="flex flex-col py-1.5">
      <div
        v-for="item in activity"
        :key="item.id"
        class="flex items-start gap-2.5 px-4.5 py-2.5 hover:bg-slate-50 transition-colors"
      >
        <div
          class="w-7 h-7 flex-none rounded-full flex items-center justify-center text-white text-[10px] font-bold mt-0.5"
          :class="item.avatarBg"
        >{{ item.initials }}</div>

        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <div class="text-[12.5px] leading-snug text-foreground/70">
            <span class="font-bold text-foreground">{{ item.who }}</span> {{ item.action }}
          </div>
          <span class="text-[11px] font-mono text-muted-foreground">{{ item.when }}</span>
        </div>

        <span
          class="inline-flex items-center h-[18px] px-1.5 rounded-full text-[10px] font-bold uppercase tracking-[.02em] flex-none mt-0.5"
          :class="item.chipClasses"
        >{{ item.type }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activity = [
  { id: 1, initials: 'RK', avatarBg: 'bg-blue-500',  who: 'Ravi Kapoor',  action: 'moved CHK-233 to In progress',           when: '2 min ago',  type: 'move',  chipClasses: 'bg-blue-50 text-blue-700' },
  { id: 2, initials: 'SM', avatarBg: 'bg-amber-500', who: 'Sofia Marsh',  action: 'completed CHK-230 Order summary redesign', when: '18 min ago', type: 'done',  chipClasses: 'bg-green-50 text-green-700' },
  { id: 3, initials: 'HN', avatarBg: 'bg-teal-500',  who: 'You',          action: 'added CHK-255 to backlog',               when: '1 hr ago',   type: 'add',   chipClasses: 'bg-slate-100 text-slate-600' },
  { id: 4, initials: 'DO', avatarBg: 'bg-slate-400', who: 'Dan Ortiz',    action: 'flagged CHK-248 as blocked',              when: '2 hrs ago',  type: 'block', chipClasses: 'bg-red-50 text-red-700' },
  { id: 5, initials: 'RK', avatarBg: 'bg-blue-500',  who: 'Ravi Kapoor',  action: 'commented on CHK-239',                   when: '3 hrs ago',  type: 'note',  chipClasses: 'bg-slate-100 text-slate-600' },
  { id: 6, initials: 'SM', avatarBg: 'bg-amber-500', who: 'Sofia Marsh',  action: 'updated estimate on CHK-252 to 3 pts',   when: 'Yesterday',  type: 'edit',  chipClasses: 'bg-amber-50 text-amber-700' },
];
</script>
