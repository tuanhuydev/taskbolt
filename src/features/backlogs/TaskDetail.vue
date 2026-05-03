<template>
  <Drawer
    direction="right"
    :fixed="true"
    :open="(props.open as boolean) ?? false"
    @update:open="
      (isOpen) => {
        if (!isOpen) emits('close');
      }
    "
  >
    <DrawerContent class="w-[600px]">
      <!-- Show form fields when editing -->
      <template v-if="isEditing && task">
        <DrawerHeader class="border-b pb-4">
          <DrawerTitle>{{ t('taskForm.editTitle') }}</DrawerTitle>
        </DrawerHeader>
        <TaskFormFields
          :initial-data="task"
          @submit="handleFormSubmit"
          @cancel="cancelEditing"
        />
      </template>

      <!-- Show task details when not editing -->
      <template v-else>
        <DrawerHeader class="border-b pb-4">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <TaskTypeIcon v-if="task" :type="task.type" />
                <span class="text-xs font-medium text-muted-foreground">
                  {{ task?.id }}
                </span>
              </div>
              <DrawerTitle class="text-xl leading-tight mb-0">
                {{ task?.title }}
              </DrawerTitle>
            </div>
            <Button 
              v-if="task" 
              variant="outline" 
              size="sm"
              @click="startEditing"
              class="shrink-0"
            >
              <Pencil class="w-4 h-4 mr-1" />
              {{ t('common.edit') }}
            </Button>
          </div>
        </DrawerHeader>

        <div v-if="task" class="flex-1 overflow-auto">
          <div class="px-6 py-6">
            <div class="space-y-6">
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Type -->
              <div class="bg-muted/30 rounded-lg p-3">
                <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  {{ t('taskForm.typeLabel') }}
                </label>
                <div class="flex items-center gap-2">
                  <TaskTypeIcon :type="task.type" />
                  <span class="text-sm font-medium">{{ t(`taskType.${task.type}`) }}</span>
                </div>
              </div>

              <!-- Status -->
              <div class="bg-muted/30 rounded-lg p-3">
                <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  {{ t('taskForm.statusLabel') }}
                </label>
                <div class="flex items-center">
                  <span 
                    :class="getStatusBadgeClass(task.status)"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    <span 
                      :class="getStatusDotClass(task.status)"
                      class="w-2 h-2 rounded-full mr-1.5"
                    ></span>
                    {{ t(`taskStatus.${task.status}`) }}
                  </span>
                </div>
              </div>

              <!-- Priority -->
              <div class="bg-muted/30 rounded-lg p-3">
                <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  {{ t('taskForm.priorityLabel') }}
                </label>
                <div class="flex items-center gap-2">
                  <TaskItemPriority :priority="taskPriority" />
                  <span class="text-sm font-medium">{{ t(`taskPriority.${taskPriority}`) }}</span>
                </div>
              </div>

              <!-- Story Points -->
              <div class="bg-muted/30 rounded-lg p-3">
                <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  {{ t('taskForm.storyPointLabel') }}
                </label>
                <div class="flex items-center">
                  <span class="text-sm font-medium">
                    {{ task.storyPoint ?? '—' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="border-t pt-6 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span class="font-medium">Created:</span>
                <span class="ml-1">{{ formatDate(task.createdAt) }}</span>
              </div>
              <div>
                <span class="font-medium">Updated:</span>
                <span class="ml-1">{{ formatDate(task.updatedAt) }}</span>
              </div>
            </div>

            <!-- Description -->
            <div v-if="task.description" class="border-t pt-6">
              <label class="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-3">
                {{ t('taskForm.descriptionLabel') }}
              </label>
              <div 
                class="prose prose-sm max-w-none text-foreground bg-muted/20 rounded-lg p-4"
                v-html="renderMarkdown(task.description)"
              ></div>
            </div>
            </div>
          </div>
        </div>

        <DrawerFooter class="border-t">
          <DrawerClose>
            <Button variant="outline" @click="emits('close')" class="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </template>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import { Task, TaskStatus, TaskPriority } from "@/shared/types/task";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import TaskFormFields from "./TaskFormFields.vue";
import TaskTypeIcon from "@/shared/components/ui/task-item/TaskTypeIcon.vue";
import TaskItemPriority from "@/shared/components/ui/task-item/TaskItemPriority.vue";
import { Pencil } from "lucide-vue-next";

const props = defineProps<{ open: boolean; task: Task | null }>();
const emits = defineEmits<{
  (e: "close"): void;
  (e: "update", data: any): void;
}>();

const { t } = useTaskboltTranslation();
const isEditing = ref<boolean>(false);

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

function handleFormSubmit(data: any, isEdit: boolean) {
  // Emit update event to parent (BacklogsPage)
  emits('update', data);
  isEditing.value = false;
  emits('close');
}

// Status badge styling
function getStatusBadgeClass(status: TaskStatus): string {
  const baseClass = "bg-opacity-10";
  switch (status) {
    case TaskStatus.TODO:
      return `${baseClass} bg-slate-500 text-slate-700 dark:text-slate-300`;
    case TaskStatus.IN_PROGRESS:
      return `${baseClass} bg-blue-500 text-blue-700 dark:text-blue-300`;
    case TaskStatus.IN_REVIEW:
      return `${baseClass} bg-amber-500 text-amber-700 dark:text-amber-300`;
    case TaskStatus.DONE:
      return `${baseClass} bg-green-500 text-green-700 dark:text-green-300`;
    default:
      return `${baseClass} bg-gray-500 text-gray-700 dark:text-gray-300`;
  }
}

function getStatusDotClass(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return "bg-slate-500";
    case TaskStatus.IN_PROGRESS:
      return "bg-blue-500";
    case TaskStatus.IN_REVIEW:
      return "bg-amber-500";
    case TaskStatus.DONE:
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

// Simple markdown to HTML converter
function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code inline
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');
  
  return `<p>${html}</p>`;
}

// Date formatter
function formatDate(dateString: string): string {
  if (!dateString) return '—';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}
</script>
