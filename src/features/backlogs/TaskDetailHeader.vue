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

            <Tooltip :open="copiedIdOpen" :disable-hoverable-content="true">
              <TooltipTrigger as-child>
                <span
                  class="cursor-pointer truncate text-xs font-medium text-primary hover:underline"
                  @click="copyTicketNumber(task?.id)"
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

            <Tooltip :open="copiedLinkOpen" :disable-hoverable-content="true">
              <TooltipTrigger as-child>
                <Button
                  v-if="task"
                  data-testid="copy-task-detail-link"
                  size="icon"
                  variant="ghost"
                  class="shrink-0 h-5 w-5 text-muted-foreground"
                  :title="t('taskDetailHeader.copyLink')"
                  @click="copyTaskDetailLink(task)"
                >
                  <Link class="h-3.5 w-3.5" />
                </Button>
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

        <h1 v-if="!isEditing" class="mb-2 px-3 text-xl font-semibold line-clamp-3">
          {{ task?.title }}
        </h1>
      </div>
    </div>
  </DrawerHeader>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { DrawerHeader } from "@/shared/components/ui/drawer";
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
  Link,
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
const router = useRouter();
const copiedIdOpen = ref(false);
const copiedLinkOpen = ref(false);
let copiedIdTimer: number | undefined;
let copiedLinkTimer: number | undefined;

const formatId = (taskId: string) => {
  const expectedIdLength = 12;
  if (taskId.length > expectedIdLength) {
    return taskId.slice(taskId.length - expectedIdLength);
  }
  return taskId;
};

// Copies the ticket number only (the id shown in the header), not a link —
// for pasting into places that just want the reference, e.g. commit messages.
const copyTicketNumber = async (taskId?: string) => {
  if (!taskId) return;

  try {
    await navigator.clipboard.writeText(formatId(taskId));
    copiedIdOpen.value = true;
    if (copiedIdTimer) clearTimeout(copiedIdTimer);
    copiedIdTimer = window.setTimeout(() => {
      copiedIdOpen.value = false;
    }, 1200);
  } catch (error) {
    copiedIdOpen.value = false;
    console.error("Failed to copy ticket number to clipboard", error);
  }
};

// Copies a shareable link to this task's dedicated detail page (as opposed
// to the ticket-number-only copy above).
const copyTaskDetailLink = async (task: Task) => {
  const link = `${window.location.origin}${
    router.resolve({
      name: "task-detail",
      params: { projectId: task.projectId ?? undefined, taskId: task.id },
    }).href
  }`;

  try {
    await navigator.clipboard.writeText(link);
    copiedLinkOpen.value = true;
    if (copiedLinkTimer) clearTimeout(copiedLinkTimer);
    copiedLinkTimer = window.setTimeout(() => {
      copiedLinkOpen.value = false;
    }, 1200);
  } catch (error) {
    copiedLinkOpen.value = false;
    console.error("Failed to copy task link to clipboard", error);
  }
};

onBeforeUnmount(() => {
  if (copiedIdTimer) clearTimeout(copiedIdTimer);
  if (copiedLinkTimer) clearTimeout(copiedLinkTimer);
});
</script>
