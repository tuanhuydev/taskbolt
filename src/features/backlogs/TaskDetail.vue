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
    <DrawerContent class="w-150">
      <TaskDetailHeader
        :task="task"
        :is-editing="isEditing"
        :is-sub-task="isSubTask"
        @start-editing="startEditing"
        @close="emits('close')"
        @create-sub-task="openCreateSubTaskModal"
        @convert-to-sub-task="convertToSubTask"
        @convert-to-task="convertToTask"
      />
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
                <span class="font-medium text-xs w-28"
                  >{{ t("taskForm.statusLabel") }}:</span
                >
                <span class="flex items-center gap-1 ml-1 text-sm">
                  <TaskItemStatus :status="task.status" />
                  {{ t(`taskStatus.${task.status}`) }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="font-medium text-xs w-28"
                  >{{ t("taskForm.priorityLabel") }}:</span
                >
                <span class="flex items-center gap-1 ml-1 text-sm">
                  <TaskItemPriority :priority="taskPriority" />
                  {{ t(`taskPriority.${taskPriority}`) }}
                </span>
              </div>
              <div v-if="task.type !== TaskType.EPIC" class="flex items-center">
                <span class="font-medium text-xs w-28"
                  >{{ t("taskForm.storyPointLabel") }}:</span
                >
                <span
                  class="ml-1 text-xs font-medium border bg-gray-100 border-gray-600 rounded-md p-1"
                  >{{ task.storyPoint ?? "—" }}</span
                >
              </div>
              <div class="flex items-center">
                <span class="font-medium text-xs w-28"
                  >{{ t("taskForm.createdLabel") }}:</span
                >
                <span class="ml-1 text-xs">{{
                  formatDate(task.createdAt)
                }}</span>
              </div>
              <div v-if="task.description">
                <span class="font-medium text-xs w-28">
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

  <!-- Create sub-task modal -->
  <Dialog :open="showCreateSubTaskModal" @update:open="closeCreateSubTaskModal">
    <DialogContent class="max-w-xl p-0 overflow-auto h-130">
      <DialogHeader class="px-4 py-3 border-b">
        <DialogTitle class="text-sm">Create sub-task</DialogTitle>
      </DialogHeader>
      <TaskFormFields
        :initial-data="subTaskInitialData"
        @submit="handleCreateSubTaskSubmit"
        @cancel="closeCreateSubTaskModal"
      />
    </DialogContent>
  </Dialog>

  <!-- Convert to sub-task modal -->
  <Dialog
    class="w-150"
    :open="showParentTaskPopup"
    @update:open="closeParentTaskPopup"
  >
    <DialogContent class="max-w-xl p-0 shrink">
      <DialogHeader class="px-4 py-3 border-b">
        <DialogTitle class="text-sm">Convert to sub-task</DialogTitle>
      </DialogHeader>

      <div class="p-4 space-y-3">
        <Input
          v-model="parentTaskQuery"
          type="text"
          placeholder="Search parent task by title or id"
        />

        <div class="max-h-72 overflow-auto border rounded-md">
          <button
            v-for="parent in filteredParentTasks"
            :key="parent.id"
            type="button"
            class="w-full text-left px-3 py-2 hover:bg-muted border-b last:border-b-0"
            @click="selectParentTask(parent.id)"
          >
            <p class="text-sm font-medium truncate">{{ parent.title }}</p>
            <p class="text-xs text-muted-foreground">
              {{ formatId(parent.id) }}
            </p>
          </button>
          <p
            v-if="filteredParentTasks.length === 0"
            class="px-3 py-4 text-sm text-muted-foreground"
          >
            No parent task found.
          </p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Drawer, DrawerContent } from "@/shared/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Task,
  TaskType,
  TaskPriority,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import TaskFormFields from "./TaskFormFields.vue";
import TaskDetailHeader from "./TaskDetailHeader.vue";
import TaskItemPriority from "@/shared/components/ui/task-item/TaskItemPriority.vue";
import TaskItemStatus from "@/shared/components/ui/task-item/TaskItemStatus.vue";
import { Input } from "@/shared/components/ui/input";

const props = defineProps<{
  open: boolean;
  task: Task | null;
  tasks: Task[];
}>();
const emits = defineEmits<{
  (e: "close"): void;
  (e: "update", data: UpdateTaskPayload): void;
  (e: "create", data: CreateTaskPayload): void;
}>();

const isSubTask = computed(() => !!props.task?.parentId);

const { t } = useTaskboltTranslation();
const isEditing = ref<boolean>(false);
const showParentTaskPopup = ref(false);
const parentTaskQuery = ref("");
const showCreateSubTaskModal = ref(false);

const subTaskInitialData = computed(() =>
  props.task ? { parentId: props.task.id } : {},
);

function openCreateSubTaskModal() {
  showCreateSubTaskModal.value = true;
}

function closeCreateSubTaskModal() {
  showCreateSubTaskModal.value = false;
}

function handleCreateSubTaskSubmit(
  data: CreateTaskPayload | UpdateTaskPayload,
  _isEdit: boolean,
) {
  if (!props.task) return;

  const payload: CreateTaskPayload = {
    ...(data as CreateTaskPayload),
    parentId: props.task.id,
  };
  emits("create", payload);
  showCreateSubTaskModal.value = false;
}

// Computed property to get priority with default value
const taskPriority = computed(() => {
  return props.task?.priority || TaskPriority.LOW;
});

const descendantTaskIds = computed(() => {
  const currentTaskId = props.task?.id;
  if (!currentTaskId) return new Set<string>();

  const childrenByParent: Record<string, string[]> = {};
  for (const task of props.tasks) {
    if (!task.parentId) continue;
    if (!childrenByParent[task.parentId]) {
      childrenByParent[task.parentId] = [];
    }
    childrenByParent[task.parentId].push(task.id);
  }

  const visited = new Set<string>();
  const stack = [...(childrenByParent[currentTaskId] ?? [])];

  while (stack.length > 0) {
    const nextId = stack.pop();
    if (!nextId || visited.has(nextId)) continue;

    visited.add(nextId);
    const children = childrenByParent[nextId] ?? [];
    for (const childId of children) {
      if (!visited.has(childId)) {
        stack.push(childId);
      }
    }
  }

  return visited;
});

const filteredParentTasks = computed(() => {
  const currentTaskId = props.task?.id;
  const query = parentTaskQuery.value.trim().toLowerCase();

  return props.tasks.filter((candidate) => {
    if (candidate.id === currentTaskId) return false;
    if (descendantTaskIds.value.has(candidate.id)) return false;
    if (candidate.parentId) return false;

    if (!query) return true;

    return (
      candidate.title.toLowerCase().includes(query) ||
      candidate.id.toLowerCase().includes(query)
    );
  });
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
  } catch {
    return dateString;
  }
}

const formatId = (taskId: string) => {
  const expectedIdLength: number = 12;
  if (taskId.length > expectedIdLength)
    return taskId.slice(taskId.length - expectedIdLength);
  return taskId;
};

const convertToTask = () => {
  if (!props.task) return;

  emits("update", {
    id: props.task.id,
    parentId: null,
  });
};

const convertToSubTask = () => {
  if (!props.task) return;
  parentTaskQuery.value = "";
  showParentTaskPopup.value = true;
};

const closeParentTaskPopup = () => {
  showParentTaskPopup.value = false;
};

const selectParentTask = (parentTaskId: string) => {
  if (!props.task) return;

  emits("update", {
    id: props.task.id,
    parentId: parentTaskId,
  });

  showParentTaskPopup.value = false;
  emits("close");
};
</script>
