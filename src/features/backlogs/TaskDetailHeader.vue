<template>
  <DrawerHeader class="p-0">
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div
          class="mb-2 flex items-center justify-between gap-2 border-b px-3 py-2"
        >
          <div class="flex min-w-0 items-center gap-2">
            <Tooltip v-if="task" :side="'left'">
              <TooltipTrigger as-child>
                <TaskTypeIcon :type="task.type" />
              </TooltipTrigger>
              <TooltipContent
                class="z-1150"
                side="left"
                :avoid-collisions="true"
              >
                {{ t(`taskType.${task.type}`) }}
              </TooltipContent>
            </Tooltip>

            <Badge v-if="task" :variant="taskTypeVariant(task.type)" class="shrink-0">
              {{ t(`taskType.${task.type}`) }}
            </Badge>

            <Tooltip :open="copiedOpen" :disable-hoverable-content="true">
              <TooltipTrigger as-child>
                <span
                  class="cursor-pointer truncate text-xs font-medium text-primary hover:underline"
                  @click="copyTaskId(task?.id)"
                >
                  {{
                    task?.id ? formatId(task.id) : t("taskDetailHeader.taskId")
                  }}
                </span>
              </TooltipTrigger>
              <TooltipContent class="z-1150">
                {{ t("taskDetailHeader.copied") }}
              </TooltipContent>
            </Tooltip>
          </div>

          <div class="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  v-if="task && !isEditing"
                  size="icon"
                  variant="outline"
                  class="shrink-0 h-5 w-5"
                >
                  <EllipsisVertical class="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-48">
                <DropdownMenuItem
                  v-if="!isSubTask"
                  @click="emit('create-sub-task')"
                >
                  <CopyPlus class="mr-2 h-4 w-4" />
                  {{ t("taskDetailHeader.createSubTask") }}
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="!isSubTask"
                  @click="emit('convert-to-sub-task')"
                >
                  <CopySlash class="mr-2 h-4 w-4" />
                  {{ t("taskDetailHeader.convertToSubTask") }}
                </DropdownMenuItem>
                <DropdownMenuItem
                  v-if="isSubTask"
                  @click="emit('convert-to-task')"
                >
                  <Copy class="mr-2 h-4 w-4" />
                  {{ t("taskDetailHeader.convertToTask") }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              v-if="task && !isEditing"
              size="icon"
              variant="outline"
              class="shrink-0 h-5 w-5"
              @click="emit('start-editing')"
            >
              <Pencil class="h-3.5 w-3.5" />
            </Button>

            <Button
              v-if="task && !isEditing"
              size="icon"
              variant="outline"
              class="shrink-0 h-5 w-5"
              @click="emit('close')"
            >
              <X class="h-2 w-2" />
            </Button>
          </div>
        </div>

        <DrawerTitle v-if="!isEditing" class="mb-2 px-3 text-xl line-clamp-3">
          {{ task?.title }}
        </DrawerTitle>
      </div>
    </div>
  </DrawerHeader>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { DrawerHeader, DrawerTitle } from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import type { Task } from "@/shared/types/task";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import TaskTypeIcon from "@/shared/components/ui/task-item/TaskTypeIcon.vue";
import { Badge } from "@/shared/components/ui/badge";
import { taskTypeVariant } from "@/shared/lib/task-display";
import {
  Pencil,
  X,
  EllipsisVertical,
  CopyPlus,
  CopySlash,
  Copy,
} from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";

defineProps<{
  task: Task | null;
  isEditing: boolean;
  isSubTask: boolean;
}>();

const emit = defineEmits<{
  (e: "start-editing"): void;
  (e: "close"): void;
  (e: "create-sub-task"): void;
  (e: "convert-to-sub-task"): void;
  (e: "convert-to-task"): void;
}>();

const { t } = useTaskboltTranslation();
const copiedOpen = ref(false);
let copiedTimer: number | undefined;

const formatId = (taskId: string) => {
  const expectedIdLength = 12;
  if (taskId.length > expectedIdLength) {
    return taskId.slice(taskId.length - expectedIdLength);
  }
  return taskId;
};

const copyTaskId = async (taskId?: string) => {
  if (!taskId) return;

  try {
    await navigator.clipboard.writeText(taskId);
    copiedOpen.value = true;

    if (copiedTimer) {
      clearTimeout(copiedTimer);
    }

    copiedTimer = window.setTimeout(() => {
      copiedOpen.value = false;
    }, 1200);
  } catch (error) {
    copiedOpen.value = false;
    console.error("Failed to copy task ID to clipboard", error);
  }
};

onBeforeUnmount(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer);
  }
});
</script>
