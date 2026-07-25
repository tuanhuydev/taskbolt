<template>
  <li
    class="mb-2 rounded-md"
    :class="{ 'mt-3 border-t border-dashed border-border pt-3': !sprint }"
  >
    <div
      class="flex items-start justify-between gap-3 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent transition-colors"
      @click="toggle"
    >
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h2
            class="text-sm font-medium truncate"
            :class="sprint ? 'text-foreground' : 'italic text-muted-foreground/70'"
          >
            {{ sprint ? sprint.name : t("backlogs.backlogBucket") }}
          </h2>
          <span
            v-if="sprint"
            class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
            :class="sprintStatusClasses[sprint.status]"
          >
            {{ t(`sprintStatus.${sprint.status}`) }}
          </span>
        </div>
        <div
          v-if="sprint?.goal"
          class="text-sm text-muted-foreground truncate [&_p]:inline"
          v-html="renderMarkdown(sprint.goal)"
        />
        <p
          v-if="sprint && (sprint.startDate || sprint.endDate)"
          class="text-xs text-muted-foreground mt-0.5"
        >
          <span v-if="sprint.startDate">{{ formatDate(sprint.startDate) }}</span>
          <span v-if="sprint.startDate && sprint.endDate"> → </span>
          <span v-if="sprint.endDate">{{ formatDate(sprint.endDate) }}</span>
        </p>
      </div>

      <Button
        size="icon"
        variant="ghost"
        class="h-7 w-7 shrink-0 text-muted-foreground"
        @click.stop="toggle"
      >
        <ChevronLeft
          class="h-4 w-4 transition-transform duration-200"
          :class="{ '-rotate-90': open }"
        />
      </Button>
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <ul v-if="open" class="flex flex-col gap-1 pl-2">
        <TaskGroup
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :sub-tasks="subTaskMap.get(task.id) ?? []"
          :active-task-id="activeTaskId"
          @click="emit('click', $event)"
        />
        <li
          v-if="!sprint && tasks.length === 0"
          class="px-2 py-1 text-sm text-muted-foreground/70"
        >
          {{ t("backlogs.empty") }}
        </li>
      </ul>
    </transition>
  </li>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ChevronLeft } from "lucide-vue-next";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { Button } from "@/shared/components/ui/button";
import { TaskGroup } from "@/shared/components/ui/task-item";
import { formatDate } from "@/shared/lib/helpers";
import { renderMarkdown } from "@/shared/lib/markdown";
import type { Task } from "@/shared/types/task";
import { Sprint, SprintStatus } from "@/shared/types/sprint";

const props = defineProps<{
  sprint: Sprint | null;
  tasks: Task[];
  subTaskMap: Map<string, Task[]>;
  activeTaskId: string | null;
}>();

const emit = defineEmits<{
  (e: "click", task: Task): void;
}>();

const { t } = useTaskboltTranslation();

const sprintStatusClasses: Record<SprintStatus, string> = {
  [SprintStatus.PLANNED]: "bg-gray-100 text-gray-600",
  [SprintStatus.ACTIVE]: "bg-green-100 text-green-700",
  [SprintStatus.COMPLETED]: "bg-blue-100 text-blue-700",
};

// Sprint rows default open; auto-expand whenever the deep-linked/selected
// task lives inside this row (as a parent or a subtask), same pattern as
// TaskGroup's own auto-expand.
const open = ref(true);

const shouldOpenForActiveTask = computed(() => {
  if (!props.activeTaskId) return open.value;
  return props.tasks.some(
    (task) =>
      task.id === props.activeTaskId ||
      (props.subTaskMap.get(task.id) ?? []).some(
        (sub) => sub.id === props.activeTaskId,
      ),
  );
});

watch(
  () => props.activeTaskId,
  () => {
    if (props.activeTaskId) open.value = shouldOpenForActiveTask.value;
  },
  { immediate: true },
);

function toggle() {
  open.value = !open.value;
}
</script>
