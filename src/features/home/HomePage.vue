<template>
  <div class="flex flex-col gap-4">
    <!-- Row 1: Greeting + Pomodoro + Sprint pulse -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_260px_1fr] gap-4 items-stretch">
      <Greeting :sprint="activeSprint" :my-task-count="myTaskCount" />
      <Pomodoro />
      <SprintPulse :sprint="activeSprint" :tasks="sprintTasks" :loading="isLoading" />
    </div>

    <!-- Row 2: My tasks + Activity feed -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
      <MyTasks :tasks="myTasks" :loading="isLoading" @toggle="handleTaskToggle" />
      <ActivityFeed />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApiClient } from '@/shared/composables/useShellServices';
import { useUserStore } from '@/configs/store';
import { getSprints } from '@/shared/services/sprint.service';
import { getTasks, updateTask } from '@/shared/services/task.service';
import { SprintStatus } from '@/shared/types/sprint';
import { type Task, TaskStatus } from '@/shared/types/task';
import type { Sprint } from '@/shared/types/sprint';
import Greeting from './Greeting.vue';
import Pomodoro from './Pomodoro.vue';
import SprintPulse from './SprintPulse.vue';
import MyTasks from './MyTasks.vue';
import ActivityFeed from './ActivityFeed.vue';

const apiClient = useApiClient();
const { user } = useUserStore();

const activeSprint = ref<Sprint | null>(null);
const sprintTasks = ref<Task[]>([]);
const isLoading = ref(false);

const myTasks = computed(() =>
  user?.id
    ? sprintTasks.value.filter(t => t.assigneeId === user.id)
    : [],
);

const myTaskCount = computed(() => myTasks.value.filter(t => t.status !== TaskStatus.DONE).length);

async function loadData() {
  if (!apiClient) return;
  isLoading.value = true;
  try {
    const sprints = await getSprints(apiClient, { status: SprintStatus.ACTIVE });
    activeSprint.value = sprints[0] ?? null;

    if (activeSprint.value) {
      sprintTasks.value = await getTasks(apiClient, { sprintId: activeSprint.value.id });
    }
  } catch (e) {
    console.error('HomePage: failed to load data', e);
  } finally {
    isLoading.value = false;
  }
}

async function handleTaskToggle(task: Task) {
  if (!apiClient) return;
  const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
  sprintTasks.value = sprintTasks.value.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
  try {
    await updateTask(apiClient, task.id, { status: newStatus });
  } catch {
    sprintTasks.value = sprintTasks.value.map(t => t.id === task.id ? { ...t, status: task.status } : t);
  }
}

onMounted(loadData);
</script>
