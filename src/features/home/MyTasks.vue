<template>
  <div class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
    <div class="px-5 py-4 border-b border-border flex items-center justify-between">
      <div class="flex flex-col gap-0.5">
        <span class="font-bold text-[14px] text-foreground">My tasks</span>
        <span class="text-[12px] text-muted-foreground">Assigned to you in active sprint</span>
      </div>
      <span class="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-slate-100 font-bold text-[11px] font-mono text-foreground">
        {{ pendingCount }}
      </span>
    </div>

    <div v-if="loading" class="flex flex-col">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-5 py-3.5 border-b border-border">
        <div class="w-5 h-5 rounded-md bg-slate-100 animate-pulse flex-none"></div>
        <div class="flex-1 h-4 bg-slate-100 rounded animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="!tasks.length" class="flex items-center justify-center py-12 text-sm text-muted-foreground">
      No tasks assigned to you
    </div>

    <div v-else class="flex flex-col">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-slate-50 transition-colors"
      >
        <button
          @click="toggleTask(task)"
          class="w-5 h-5 flex-none rounded-[6px] border-2 flex items-center justify-center transition-colors cursor-pointer"
          :class="isDone(task) ? 'border-primary bg-primary' : 'border-slate-400 bg-transparent'"
        >
          <svg v-if="isDone(task)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>

        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <span
            class="text-[13.5px] font-semibold truncate"
            :class="isDone(task) ? 'text-muted-foreground line-through' : 'text-foreground'"
          >{{ task.title }}</span>
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-mono text-muted-foreground">{{ ticketId(task.id) }}</span>
            <span
              class="inline-flex items-center h-[18px] px-1.5 rounded-full text-[10px] font-bold uppercase tracking-[.03em]"
              :class="typeStyle(task.type).classes"
            >{{ task.type }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-none">
          <span class="inline-flex items-center gap-1 text-[11.5px] font-semibold" :class="priorityStyle(task.priority).fg">
            <span class="w-1.5 h-1.5 rounded-full" :class="priorityStyle(task.priority).dot"></span>
            {{ task.priority }}
          </span>
          <span class="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md bg-slate-100 font-bold text-[11px] font-mono text-foreground">
            {{ task.storyPoint }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type Task, TaskStatus, TaskType, TaskPriority } from '@/shared/types/task';

const props = defineProps<{
  tasks: Task[];
  loading: boolean;
}>();

const emit = defineEmits<{
  toggle: [task: Task];
}>();

const pendingCount = computed(() => props.tasks.filter(t => t.status !== TaskStatus.DONE).length);

function isDone(task: Task) {
  return task.status === TaskStatus.DONE;
}

function toggleTask(task: Task) {
  emit('toggle', task);
}

function ticketId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function typeStyle(type: TaskType) {
  const map: Record<TaskType, { classes: string }> = {
    [TaskType.STORY]:  { classes: 'bg-blue-50 text-blue-700' },
    [TaskType.BUG]:    { classes: 'bg-red-50 text-red-700' },
    [TaskType.EPIC]:   { classes: 'bg-purple-50 text-purple-700' },
    [TaskType.ISSUE]:  { classes: 'bg-amber-50 text-amber-700' },
  };
  return map[type] ?? { classes: 'bg-slate-100 text-slate-600' };
}

function priorityStyle(priority: TaskPriority) {
  const map: Record<TaskPriority, { dot: string; fg: string }> = {
    [TaskPriority.HIGHEST]: { dot: 'bg-red-500',   fg: 'text-red-700' },
    [TaskPriority.HIGH]:    { dot: 'bg-red-500',   fg: 'text-red-700' },
    [TaskPriority.MEDIUM]:  { dot: 'bg-amber-500', fg: 'text-amber-700' },
    [TaskPriority.LOW]:     { dot: 'bg-slate-400', fg: 'text-muted-foreground' },
  };
  return map[priority] ?? { dot: 'bg-slate-400', fg: 'text-muted-foreground' };
}
</script>
