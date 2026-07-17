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
    <DrawerContent class="w-full sm:w-[720px]! max-w-full sm:max-w-[92vw]!">
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
          :members="props.members"
          :sprints="props.sprints"
          @submit="handleFormSubmit"
          @cancel="cancelEditing"
        />
      </template>

      <!-- Show task details when not editing -->
      <template v-else>
        <div
          v-if="task"
          class="flex-1 min-h-0 flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden"
        >
          <!-- Content column -->
          <div
            class="flex-1 min-w-0 sm:overflow-auto px-4 py-4 space-y-6 flex flex-col"
          >
            <div v-if="task.description" class="space-y-2 flex-1">
              <span
                class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {{ t("taskForm.descriptionLabel") }}
              </span>
              <div
                class="prose prose-sm max-w-none text-foreground bg-muted/20 rounded-lg py-3 text-sm"
                v-html="renderMarkdown(task.description)"
              ></div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {{ t("taskDetail.subtasksLabel") }}
                </span>
                <span
                  v-if="subtasks.length"
                  class="text-xs font-mono text-muted-foreground"
                >
                  {{ subtasksProgressLabel }}
                </span>
              </div>
              <Progress
                v-if="subtasks.length"
                :model-value="doneCount"
                :max="subtasks.length"
              />
              <div
                v-if="subtasks.length"
                class="flex flex-col border rounded-md overflow-hidden divide-y"
              >
                <div
                  v-for="sub in subtasks"
                  :key="sub.id"
                  class="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40"
                >
                  <Checkbox
                    :model-value="sub.status === TaskStatus.DONE"
                    @update:model-value="() => toggleSubtask(sub)"
                  />
                  <span
                    class="flex-1 text-sm font-medium"
                    :class="
                      sub.status === TaskStatus.DONE
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    "
                  >
                    {{ sub.title }}
                  </span>
                  <span class="text-xs font-mono text-muted-foreground">{{
                    formatId(sub.id)
                  }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground">
                {{ t("taskDetail.noSubtasks") }}
              </p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {{ t("taskDetail.commentsLabel") }}
                </span>
                <span
                  v-if="comments.length"
                  class="text-xs font-mono text-muted-foreground"
                >
                  {{ comments.length }}
                </span>
              </div>

              <p v-if="commentsLoading" class="text-sm text-muted-foreground">
                {{ t("common.loading") }}
              </p>
              <template v-else>
                <div
                  v-if="comments.length"
                  class="max-h-60 overflow-y-auto space-y-3 pr-1"
                >
                  <div
                    v-for="comment in comments"
                    :key="comment.id"
                    class="flex items-start gap-3"
                  >
                    <AvatarInitials
                      :name="commentAuthorName(comment)"
                      :color-key="comment.createdById"
                      size="sm"
                      class="mt-0.5"
                    />
                    <div class="flex-1 min-w-0 space-y-1">
                      <div class="flex items-baseline gap-2">
                        <span class="text-sm font-semibold text-foreground">{{
                          commentAuthorName(comment)
                        }}</span>
                        <span class="text-xs font-mono text-muted-foreground">{{
                          formatDate(comment.createdAt)
                        }}</span>
                      </div>
                      <div
                        class="prose prose-sm max-w-none bg-muted/40 border rounded-md px-3 py-2 text-sm text-foreground wrap-break-word"
                        v-html="renderMarkdown(comment.content)"
                      ></div>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-muted-foreground">
                  {{ t("taskDetail.noComments") }}
                </p>
              </template>

              <div class="flex items-start gap-3 pt-1">
                <AvatarInitials
                  v-if="currentUserId"
                  :name="selfMember?.userName ?? t('taskDetail.you')"
                  :color-key="selfMember?.userId ?? currentUserId"
                  size="sm"
                  class="mt-0.5"
                />
                <div class="flex-1 space-y-2">
                  <MarkdownEditor
                    v-model="newCommentText"
                    :placeholder="t('taskDetail.commentPlaceholder')"
                  />
                  <div class="flex justify-end">
                    <Button
                      size="sm"
                      :disabled="submittingComment || !newCommentText.trim()"
                      @click="submitComment"
                    >
                      {{ t("taskDetail.commentSubmit") }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Properties rail -->
          <div
            class="w-full sm:w-58 flex-none border-t sm:border-t-0 sm:border-l bg-muted/30 overflow-auto px-4 py-4 space-y-5"
          >
            <span
              class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {{ t("taskDetail.detailsLabel") }}
            </span>

            <div class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskForm.statusLabel")
              }}</span>
              <span class="flex items-center gap-1.5 text-sm">
                <TaskItemStatus :status="task.status" />
                {{ t(`taskStatus.${task.status}`) }}
              </span>
            </div>

            <div class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskForm.priorityLabel")
              }}</span>
              <span class="flex items-center gap-1.5 text-sm">
                <TaskItemPriority :priority="taskPriority" />
                {{ t(`taskPriority.${taskPriority}`) }}
              </span>
            </div>

            <div v-if="task.type !== TaskType.EPIC" class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskForm.storyPointLabel")
              }}</span>
              <span
                class="inline-flex text-xs font-medium border bg-gray-100 border-gray-300 rounded-md px-2 py-1"
                >{{ task.storyPoint ?? "—" }}</span
              >
            </div>

            <div class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskDetail.assigneeLabel")
              }}</span>
              <div v-if="assigneeMember" class="flex items-center gap-2">
                <AvatarInitials :name="assigneeMember.userName" size="sm" />
                <span class="text-sm font-medium">{{
                  assigneeMember.userName
                }}</span>
              </div>
              <span v-else class="text-sm text-muted-foreground">{{
                t("taskDetail.unassigned")
              }}</span>
            </div>

            <div class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskDetail.reporterLabel")
              }}</span>
              <div v-if="reporterMember" class="flex items-center gap-2">
                <AvatarInitials :name="reporterMember.userName" size="sm" />
                <span class="text-sm font-medium">{{
                  reporterMember.userName
                }}</span>
              </div>
              <span v-else class="text-sm text-muted-foreground">—</span>
            </div>

            <div class="h-px bg-border"></div>

            <div class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskDetail.sprintLabel")
              }}</span>
              <span class="text-sm font-medium">{{ sprintName }}</span>
            </div>

            <div class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskForm.createdLabel")
              }}</span>
              <span class="text-xs">{{ formatDate(task.createdAt) }}</span>
            </div>

            <div class="space-y-1">
              <span class="block text-xs font-medium text-muted-foreground">{{
                t("taskDetail.updatedLabel")
              }}</span>
              <span class="text-xs">{{ formatDate(task.updatedAt) }}</span>
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
        :members="props.members"
        :sprints="props.sprints"
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
import { ref, computed, watch } from "vue";
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
  TaskStatus,
  TaskPriority,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import type { ProjectMember } from "@/shared/types/member";
import type { Sprint } from "@/shared/types/sprint";
import type { Comment } from "@/shared/types/comment";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import { formatDate } from "@/shared/lib/date";
import { renderMarkdown } from "@/shared/lib/markdown";
import { decodeJwtPayload } from "@/shared/lib/jwt";
import { getComments, createComment } from "@/shared/services";
import TaskFormFields from "./TaskFormFields.vue";
import TaskDetailHeader from "./TaskDetailHeader.vue";
import TaskItemPriority from "@/shared/components/ui/task-item/TaskItemPriority.vue";
import TaskItemStatus from "@/shared/components/ui/task-item/TaskItemStatus.vue";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { MarkdownEditor } from "@/shared/components/ui/markdown-editor";
import { Progress } from "@/shared/components/ui/progress";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { AvatarInitials } from "@/shared/components/ui/avatar";

const props = withDefaults(
  defineProps<{
    open: boolean;
    task: Task | null;
    tasks: Task[];
    members?: ProjectMember[];
    sprints?: Sprint[];
  }>(),
  {
    members: () => [],
    sprints: () => [],
  },
);
const emits = defineEmits<{
  (e: "close"): void;
  (e: "update", data: UpdateTaskPayload): void;
  (e: "create", data: CreateTaskPayload): void;
}>();

const isSubTask = computed(() => !!props.task?.parentId);

const { t } = useTaskboltTranslation();
const { getApiClient, getToastService } = useShellServices();
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

// Subtasks: direct children of the current task, derived from the flat task list
const subtasks = computed(() =>
  props.tasks.filter((candidate) => candidate.parentId === props.task?.id),
);
const doneCount = computed(
  () => subtasks.value.filter((sub) => sub.status === TaskStatus.DONE).length,
);
const subtasksProgressLabel = computed(() =>
  t("taskDetail.subtasksProgress")
    .replace("{{done}}", String(doneCount.value))
    .replace("{{total}}", String(subtasks.value.length)),
);

function toggleSubtask(subtask: Task) {
  const nextStatus =
    subtask.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
  emits("update", { id: subtask.id, status: nextStatus });
}

// Assignee / reporter resolution against the project member list
const memberMap = computed(() => {
  const map = new Map<string, ProjectMember>();
  props.members.forEach((member) => map.set(member.userId, member));
  return map;
});

const assigneeMember = computed(() =>
  props.task?.assigneeId
    ? memberMap.value.get(props.task.assigneeId)
    : undefined,
);
const reporterMember = computed(() =>
  props.task?.createdById
    ? memberMap.value.get(props.task.createdById)
    : undefined,
);

const sprintName = computed(() => {
  const sprint = props.sprints.find((s) => s.id === props.task?.sprintId);
  return sprint?.name ?? t("taskDetail.noSprint");
});

// Comments — fetched per-task on demand (not prop-drilled) since they're a
// sub-resource of "viewing this specific task", not page-level list data.
const comments = ref<Comment[]>([]);
const commentsLoading = ref(false);
const newCommentText = ref("");
const submittingComment = ref(false);

// Resolves the current user id from the JWT's `sub` claim. Tasks/comments
// created outside a project (personal workspace) have no member list to
// join against, so this is also used as a fallback for identifying "your"
// own comments when the author isn't found in `memberMap`.
const currentUserId = computed(() => {
  const apiClient = getApiClient();
  const token = apiClient?.getAccessToken();
  if (!token) return undefined;

  const decoded = decodeJwtPayload(token);
  return decoded?.sub;
});

function commentAuthorName(comment: Comment): string {
  const member = memberMap.value.get(comment.createdById);
  if (member) return member.userName;
  if (comment.createdById === currentUserId.value) return t("taskDetail.you");
  return t("taskDetail.unknownUser");
}

// Resolves the current user against the project member list purely to show
// their avatar/name next to the compose box — no dedicated "current user"
// endpoint call needed for that.
const selfMember = computed(() =>
  currentUserId.value ? memberMap.value.get(currentUserId.value) : undefined,
);

async function fetchComments(taskId: string) {
  const apiClient = getApiClient();
  if (!apiClient) return;

  commentsLoading.value = true;
  try {
    comments.value = await getComments(apiClient, {
      taskId,
      sortBy: "createdAt",
      sortOrder: "asc",
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    getToastService()?.error(t("toast.commentsLoadFailed"));
  } finally {
    commentsLoading.value = false;
  }
}

watch(
  () => props.task?.id,
  (taskId) => {
    newCommentText.value = "";
    if (taskId) {
      fetchComments(taskId);
    } else {
      comments.value = [];
    }
  },
  { immediate: true },
);

async function submitComment() {
  const content = newCommentText.value.trim();
  if (!content || !props.task) return;

  const apiClient = getApiClient();
  if (!apiClient) {
    getToastService()?.error(t("toast.apiClientUnavailable"));
    return;
  }

  submittingComment.value = true;
  try {
    const comment = await createComment(apiClient, {
      taskId: props.task.id,
      content,
    });
    comments.value = [...comments.value, comment];
    newCommentText.value = "";
  } catch (err) {
    console.error("Error creating comment:", err);
    getToastService()?.error(t("toast.commentAddFailed"));
  } finally {
    submittingComment.value = false;
  }
}

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
