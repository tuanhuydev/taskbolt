<template>
  <Drawer
    direction="right"
    :fixed="true"
    :dismissible="false"
    :open="(props.open as boolean) ?? false"
    @update:open="
      (isOpen) => {
        if (!isOpen) emits('close');
      }
    "
  >
    <DrawerContent class="w-[600px]">
      <DrawerHeader class="p-0">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div
              class="flex items-center gap-2 px-3 py-2 justify-between border-b mb-2"
            >
              <div class="flex items-center gap-2 min-w-0">
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

                <Tooltip :open="copiedOpen" :disable-hoverable-content="true">
                  <TooltipTrigger as-child>
                    <span
                      class="cursor-pointer text-xs font-medium truncate text-primary hover:underline"
                      @click="copyTaskId(task?.id)"
                    >
                      {{ task?.id ? formatId(task.id) : "TaskID" }}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent class="z-1150"> Copied </TooltipContent>
                </Tooltip>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  v-if="task && !isEditing"
                  size="icon"
                  class="shrink-0 h-5 w-5"
                  @click="startEditing"
                >
                  <Pencil class="w-3.5! h-3.5!" />
                </Button>
                <Button
                  v-if="task && !isEditing"
                  size="icon"
                  class="shrink-0 h-5 w-5"
                  @click="emits('close')"
                >
                  <X class="w-2 h-2" />
                </Button>
              </div>
            </div>
            <DrawerTitle
              v-if="!isEditing"
              class="text-xl px-3 line-clamp-3 mb-2"
            >
              {{ task?.title }}
            </DrawerTitle>
          </div>
        </div>
      </DrawerHeader>
      <!-- Show form fields when editing -->
      <template v-if="isEditing && task">
        <TaskFormFields
          :initial-data="task"
          @submit="handleFormSubmit"
          @cancel="cancelEditing"
        />
      </template>

      <!-- Show task details when not editing -->
      <template v-else>
        <div v-if="task" class="flex-1 overflow-auto">
          <div class="space-y-6 px-3">
            <div class="grid grid-cols-1 gap-2 text-muted-foreground">
              <div class="flex items-center">
                <span class="font-medium text-xs w-25"
                  >{{ t("taskForm.statusLabel") }}:</span
                >
                <span class="flex items-center gap-1 ml-1 text-sm">
                  <TaskItemStatus :status="task.status" />
                  {{ t(`taskStatus.${task.status}`) }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-xs w-25"
                  >{{ t("taskForm.priorityLabel") }}:</span
                >
                <span class="flex items-center gap-1 ml-1 text-sm">
                  <TaskItemPriority :priority="taskPriority" />
                  {{ t(`taskPriority.${taskPriority}`) }}
                </span>
              </div>
              <div v-if="task.type !== TaskType.EPIC" class="flex items-center">
                <span class="font-medium text-xs w-25"
                  >{{ t("taskForm.storyPointLabel") }}:</span
                >
                <span
                  class="ml-1 text-xs font-medium border bg-gray-100 border-gray-600 rounded-md p-1"
                  >{{ task.storyPoint ?? "—" }}</span
                >
              </div>
              <div class="flex items-center">
                <span class="font-medium text-xs w-25"
                  >{{ t("taskForm.createdLabel") }}:</span
                >
                <span class="ml-1 text-xs">{{
                  formatDate(task.createdAt)
                }}</span>
              </div>
              <div v-if="task.description">
                <span class="font-medium text-xs w-25">
                  {{ t("taskForm.descriptionLabel") }}:</span
                >
                <div
                  class="prose prose-sm max-w-none text-foreground bg-muted/20 rounded-lg py-3 text-sm"
                  v-html="renderMarkdown(task.description)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from "vue";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import {
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import TaskFormFields from "./TaskFormFields.vue";
import TaskTypeIcon from "@/shared/components/ui/task-item/TaskTypeIcon.vue";
import TaskItemPriority from "@/shared/components/ui/task-item/TaskItemPriority.vue";
import TaskItemStatus from "@/shared/components/ui/task-item/TaskItemStatus.vue";
import { Pencil, X } from "lucide-vue-next";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/shared/components/ui/tooltip";

const props = defineProps<{ open: boolean; task: Task | null }>();
const emits = defineEmits<{
  (e: "close"): void;
  (e: "update", data: UpdateTaskPayload): void;
}>();

const { t } = useTaskboltTranslation();
const isEditing = ref<boolean>(false);
const copiedOpen = ref(false);
let copiedTimer: number | undefined;

// Computed property to get priority with default value
const taskPriority = computed(() => {
  return props.task?.priority || TaskPriority.LOW;
});

function startEditing() {
  isEditing.value = true;
}

function cancelEditing() {
  isEditing.value = false;
}

function handleFormSubmit(
  data: CreateTaskPayload | UpdateTaskPayload,
  _isEdit: boolean,
) {
  // Emit update event to parent (BacklogsPage)
  emits("update", data as UpdateTaskPayload);
  isEditing.value = false;
  emits("close");
}

// Simple markdown to HTML converter
function renderMarkdown(markdown: string): string {
  if (!markdown) return "";

  const html = markdown
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    // Code inline
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" target="_blank">$1</a>',
    )
    // Line breaks
    .replace(/\n\n/gim, "</p><p>")
    .replace(/\n/gim, "<br>");

  return `<p>${html}</p>`;
}

// Date formatter
function formatDate(dateString: string): string {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

const formatId = (taskId: string) => {
  const expectedIdLength: number = 12;
  if (taskId.length > expectedIdLength)
    return taskId.slice(taskId.length - expectedIdLength);
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
  } catch (e) {
    copiedOpen.value = false;
    console.error("Failed to copy task ID to clipboard", e);
    return;
  }
};

onBeforeUnmount(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer);
  }
});
</script>
