<template>
  <div class="flex-1 flex flex-col gap-4 min-h-0">
    <!-- Page header -->
    <div class="flex items-start justify-between gap-4 flex-none">
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2.5">
          <h1
            class="text-[26px] font-extrabold tracking-tight text-foreground leading-none"
          >
            {{ t("activeSprint.title") }}
          </h1>
          <span
            v-if="activeSprint && !isLoading"
            class="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-green-50 text-green-700 text-[11px] font-bold uppercase tracking-wide"
          >
            <span
              class="w-1.5 h-1.5 rounded-full bg-green-500 flex-none"
            ></span>
            Live
          </span>
        </div>
        <div
          v-if="activeSprint"
          class="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span class="font-semibold text-foreground/80">{{
            activeSprint.name
          }}</span>
          <template v-if="activeSprint.goal">
            <span class="text-slate-300">·</span>
            <span class="truncate max-w-xs">{{ activeSprint.goal }}</span>
          </template>
          <template v-if="sprintDateRange">
            <span class="w-1 h-1 rounded-full bg-slate-300 flex-none"></span>
            <span class="font-mono text-xs">{{ sprintDateRange }}</span>
          </template>
        </div>
      </div>
      <button
        v-if="activeSprint"
        class="inline-flex items-center gap-2 h-9 px-3.5 rounded-md bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity flex-none"
        @click="openCreateTask()"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {{ t("activeSprint.addTask") }}
      </button>
    </div>

    <!-- Sprint progress bar -->
    <div
      v-if="activeSprint && !isLoading"
      class="flex-none flex items-center gap-6 bg-white border border-border rounded-lg shadow-sm px-4 py-3.5"
    >
      <!-- Days left -->
      <div class="flex flex-col gap-0.5 flex-none">
        <span
          class="text-[11px] font-bold uppercase tracking-widest text-slate-400"
          >Days left</span
        >
        <span class="text-lg font-bold font-mono text-foreground">{{
          daysLeft
        }}</span>
      </div>
      <div class="w-px self-stretch bg-border flex-none"></div>
      <!-- Progress -->
      <div class="flex flex-col gap-1.5 flex-1 min-w-0">
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-semibold text-foreground/70">
            {{ donePoints }} of {{ totalPoints }} points completed
          </span>
          <span class="text-xs font-bold font-mono text-primary flex-none"
            >{{ progressPct }}%</span
          >
        </div>
        <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            class="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            :style="{ width: progressPct + '%' }"
          ></div>
        </div>
      </div>
      <div
        v-if="memberCount > 0"
        class="w-px self-stretch bg-border flex-none"
      ></div>
      <!-- Team -->
      <div v-if="memberCount > 0" class="flex items-center gap-3 flex-none">
        <div class="flex flex-col gap-0.5">
          <span
            class="text-[11px] font-bold uppercase tracking-widest text-slate-400"
            >Team</span
          >
          <span class="text-lg font-bold font-mono text-foreground">{{
            memberCount
          }}</span>
        </div>
        <div class="flex">
          <div
            v-for="(member, i) in visibleMembers"
            :key="member.userId"
            :title="member.userName"
            class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white flex-none"
            :class="[memberBgColor(i), i > 0 ? '-ml-2' : '']"
          >
            {{ getInitials(member.userName) }}
          </div>
          <div
            v-if="hiddenMembersCount > 0"
            class="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[10px] font-bold border-2 border-white -ml-2 flex-none"
          >
            +{{ hiddenMembersCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <span class="text-sm text-muted-foreground">{{
        t("common.loading")
      }}</span>
    </div>

    <!-- No active sprint -->
    <div
      v-else-if="!activeSprint"
      class="flex-1 flex items-center justify-center"
    >
      <div class="text-center flex flex-col items-center gap-3">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-muted-foreground/40"
        >
          <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
        </svg>
        <p class="text-muted-foreground text-sm">
          {{
            selectedProjectId
              ? t("activeSprint.noSprint")
              : t("activeSprint.selectProjectPrompt")
          }}
        </p>
      </div>
    </div>

    <!-- Kanban board -->
    <div v-else class="flex-1 min-h-0 flex gap-4 pb-4">
      <div
        v-for="col in columns"
        :key="col.id"
        class="flex-1 min-w-0 flex flex-col rounded-lg border transition-colors"
        :class="
          dragOverCol === col.id
            ? 'border-primary bg-primary/5'
            : 'border-border bg-slate-50'
        "
        @dragover.prevent
        @dragenter.prevent="dragOverCol = col.id"
        @dragleave="handleDragLeave($event, col.id)"
        @drop.prevent="handleDrop(col.id)"
      >
        <!-- Column header -->
        <div class="flex-none flex items-center gap-2 px-3.5 pt-3.5 pb-2.5">
          <span
            class="w-2 h-2 rounded-full flex-none"
            :class="col.accentClass"
          ></span>
          <span class="text-sm font-bold text-foreground tracking-tight">{{
            col.name
          }}</span>
          <span
            class="inline-flex items-center justify-center min-w-5.5 h-5 px-1.5 rounded-full text-[11px] font-bold font-mono"
            :class="col.countClass"
            >{{ col.tasks.length }}</span
          >
          <div class="flex-1"></div>
          <button
            v-if="col.id !== TaskStatus.DONE"
            class="w-6 h-6 flex items-center justify-center bg-transparent rounded-md text-slate-400 hover:bg-slate-200 hover:text-foreground transition-colors"
            @click="openCreateTask(col.id)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <!-- Cards -->
        <div
          class="flex-1 min-h-0 overflow-y-auto px-2.5 pb-2.5 flex flex-col gap-2.5"
        >
          <div
            v-for="task in col.tasks"
            :key="task.id"
            draggable="true"
            class="bg-white border border-border rounded-md shadow-sm px-3.5 py-3.5 flex flex-col gap-2.5 cursor-grab hover:shadow-md hover:-translate-y-0.5 active:cursor-grabbing transition-all select-none"
            :class="[
              draggingId === task.id ? 'opacity-40' : '',
              task.status === TaskStatus.CLOSED ? 'opacity-60' : '',
            ]"
            @dragstart="handleDragStart(task.id, col.id)"
            @dragend="handleDragEnd"
            @click="selectTask(task)"
          >
            <!-- Ticket + Tag -->
            <div class="flex items-center justify-between gap-2">
              <span
                class="text-[11px] font-mono text-slate-400 tracking-wide"
                >{{ taskTicket(task.id) }}</span
              >
              <div class="flex items-center gap-1.5">
                <span
                  v-if="task.status === TaskStatus.CLOSED"
                  class="inline-flex items-center h-5 px-2 rounded-full text-[10.5px] font-bold uppercase tracking-wide bg-red-50 text-red-700"
                  >{{ t("taskStatus.CLOSED") }}</span
                >
                <span
                  class="inline-flex items-center h-5 px-2 rounded-full text-[10.5px] font-bold uppercase tracking-wide"
                  :class="tagStyle(task.type).classes"
                  >{{ tagLabel(task.type) }}</span
                >
              </div>
            </div>
            <!-- Title -->
            <div
              class="text-[13.5px] font-semibold leading-snug text-foreground"
            >
              {{ task.title }}
            </div>
            <!-- Meta row -->
            <div class="flex items-center gap-2 mt-0.5">
              <span
                class="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                :class="priorityStyle(task.priority).textClass"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full flex-none"
                  :class="priorityStyle(task.priority).dotClass"
                ></span>
                {{ priorityLabel(task.priority) }}
              </span>
              <span
                v-if="task.storyPoint"
                class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-md bg-slate-100 text-foreground text-[11px] font-bold font-mono"
                >{{ task.storyPoint }}</span
              >
              <div class="flex-1"></div>
              <div
                v-if="task.assigneeId"
                :title="getMemberName(task.assigneeId)"
                class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-none"
                :class="assigneeColor(task.assigneeId)"
              >
                {{ getMemberInitials(task.assigneeId) }}
              </div>
            </div>
          </div>

          <!-- Inline add-task button — Done is reached by moving a task
               through the workflow, not by creating one there directly. -->
          <button
            v-if="col.id !== TaskStatus.DONE"
            class="flex items-center gap-1.5 w-full px-2.5 py-2.5 border border-dashed border-border bg-transparent rounded-md text-slate-400 text-xs font-semibold hover:bg-white hover:text-foreground hover:border-slate-400 transition-colors"
            @click="openCreateTask(col.id)"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {{ t("activeSprint.addTask") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Task form drawer -->
    <TaskForm
      :open="showTaskForm"
      :initial-data="taskFormInitialData"
      @submit="handleTaskFormSubmit"
      @close="showTaskForm = false"
    />

    <!-- Task detail drawer -->
    <TaskDetail
      :task="selectedTask"
      :tasks="tasks"
      :members="members"
      :sprints="sprints"
      :open="shouldShowTaskDetail"
      @close="closeTaskDetail"
      @update="(data) => handleTaskFormSubmit(data, true)"
      @create="(data) => handleTaskFormSubmit(data, false)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import { useProjectContext } from "@/shared/composables/useProject";
import { useProjectRouteSync } from "@/shared/composables/useProjectRouteSync";
import { getSprints, getTasks, getProjectMembers, createTask, updateTask } from "@/shared/services";
import { type Sprint, SprintStatus } from "@/shared/types/sprint";
import {
  TaskStatus,
  TaskType,
  TaskPriority,
  type Task,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import { type ProjectMember } from "@/shared/types/member";
import { TaskForm, TaskDetail } from "@/features/backlogs";

const { t } = useTaskboltTranslation();
const { getApiClient, getToastService } = useShellServices();
const { selectedProjectId } = useProjectContext();
useProjectRouteSync();

// ── State ──────────────────────────────────────────────────────────────────
const activeSprint = ref<Sprint | null>(null);
const tasks = ref<Task[]>([]);
const members = ref<ProjectMember[]>([]);
const isLoading = ref(false);
const draggingId = ref<string | null>(null);
const draggingFromCol = ref<TaskStatus | null>(null);
const dragOverCol = ref<TaskStatus | null>(null);
const showTaskForm = ref(false);
const taskFormInitialData = ref<Partial<Task>>({});
const selectedTask = ref<Task | null>(null);
const shouldShowTaskDetail = ref(false);
const sprints = computed(() =>
  activeSprint.value ? [activeSprint.value] : [],
);

// ── Column definitions ─────────────────────────────────────────────────────
const COLUMNS: Array<{
  id: TaskStatus;
  name: string;
  accentClass: string;
  countClass: string;
}> = [
  {
    id: TaskStatus.TODO,
    name: "To do",
    accentClass: "bg-slate-400",
    countClass: "bg-slate-200 text-slate-700",
  },
  {
    id: TaskStatus.IN_PROGRESS,
    name: "In progress",
    accentClass: "bg-primary",
    countClass: "bg-slate-200 text-slate-700",
  },
  {
    id: TaskStatus.DONE,
    name: "Done",
    accentClass: "bg-green-600",
    countClass: "bg-green-100 text-green-700",
  },
];

// Single pass over tasks.value backing columns + points stats below, instead
// of a separate filter/reduce per derived value — keeps board recompute at
// O(n) per task mutation rather than O(n * derivedValues).
const boardStats = computed(() => {
  const tasksByColumn = new Map<TaskStatus, Task[]>(
    COLUMNS.map((col) => [col.id, []]),
  );
  let donePointsSum = 0;
  let totalPointsSum = 0;

  for (const task of tasks.value) {
    // Closed (obsoleted) tasks don't get their own column — they're folded
    // into Done so completed-but-obsoleted work is still visible on the
    // board instead of vanishing, without adding a 4th column for what's a
    // rare edge case.
    const columnId =
      task.status === TaskStatus.CLOSED ? TaskStatus.DONE : task.status;
    tasksByColumn.get(columnId)?.push(task);

    if (task.status === TaskStatus.DONE) {
      donePointsSum += task.storyPoint ?? 0;
    }
    // Closed tasks are obsoleted work — excluded from the points total so
    // completing/obsoleting a task doesn't skew sprint progress either way.
    if (task.status !== TaskStatus.CLOSED) {
      totalPointsSum += task.storyPoint ?? 0;
    }
  }

  return { tasksByColumn, donePoints: donePointsSum, totalPoints: totalPointsSum };
});

const columns = computed(() =>
  COLUMNS.map((col) => ({
    ...col,
    tasks: boardStats.value.tasksByColumn.get(col.id) ?? [],
  })),
);

// ── Sprint meta ────────────────────────────────────────────────────────────
const sprintDateRange = computed(() => {
  if (!activeSprint.value) return "";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const { startDate: s, endDate: e } = activeSprint.value;
  if (s && e) return `${fmt(s)} – ${fmt(e)}`;
  if (s) return `From ${fmt(s)}`;
  return "";
});

const daysLeft = computed(() => {
  if (!activeSprint.value?.endDate) return "–";
  const end = new Date(activeSprint.value.endDate);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
});

// ── Progress stats ─────────────────────────────────────────────────────────
const donePoints = computed(() => boardStats.value.donePoints);
const totalPoints = computed(() => boardStats.value.totalPoints);
const progressPct = computed(() =>
  totalPoints.value
    ? Math.round((donePoints.value / totalPoints.value) * 100)
    : 0,
);

// ── Team member display ────────────────────────────────────────────────────
const MAX_VISIBLE = 3;
const visibleMembers = computed(() => members.value.slice(0, MAX_VISIBLE));
const hiddenMembersCount = computed(() =>
  Math.max(0, members.value.length - MAX_VISIBLE),
);
const memberCount = computed(() => members.value.length);

const AVATAR_COLORS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

function memberBgColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

const memberMap = computed(() => {
  const map = new Map<string, ProjectMember>();
  members.value.forEach((m) => map.set(m.userId, m));
  return map;
});

function getMemberName(userId: string) {
  return memberMap.value.get(userId)?.userName ?? "";
}

function getMemberInitials(userId: string) {
  const name = getMemberName(userId);
  return name ? getInitials(name) : userId.slice(0, 2).toUpperCase();
}

function assigneeColor(userId: string) {
  const hash = [...userId].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ── Tag / priority helpers ─────────────────────────────────────────────────
interface StyleEntry {
  classes: string;
  label: string;
}
const TAG_MAP: Record<TaskType, StyleEntry> = {
  [TaskType.STORY]: {
    classes: "bg-blue-50 text-blue-700",
    label: t("taskType.STORY"),
  },
  [TaskType.EPIC]: {
    classes: "bg-violet-50 text-violet-700",
    label: t("taskType.EPIC"),
  },
  [TaskType.ISSUE]: {
    classes: "bg-sky-50 text-sky-700",
    label: t("taskType.ISSUE"),
  },
  [TaskType.BUG]: {
    classes: "bg-red-50 text-red-700",
    label: t("taskType.BUG"),
  },
};

function tagStyle(type: TaskType): StyleEntry {
  return (
    TAG_MAP[type] ?? { classes: "bg-slate-100 text-slate-700", label: type }
  );
}
function tagLabel(type: TaskType) {
  return (TAG_MAP[type] ?? { label: type }).label;
}

interface PriorityEntry {
  dotClass: string;
  textClass: string;
  label: string;
}
const PRIORITY_MAP: Record<TaskPriority, PriorityEntry> = {
  [TaskPriority.HIGHEST]: {
    dotClass: "bg-red-500",
    textClass: "text-red-700",
    label: t("taskPriority.HIGHEST"),
  },
  [TaskPriority.HIGH]: {
    dotClass: "bg-red-500",
    textClass: "text-red-700",
    label: t("taskPriority.HIGH"),
  },
  [TaskPriority.MEDIUM]: {
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
    label: t("taskPriority.MEDIUM"),
  },
  [TaskPriority.LOW]: {
    dotClass: "bg-slate-400",
    textClass: "text-slate-400",
    label: t("taskPriority.LOW"),
  },
};

function priorityStyle(priority: TaskPriority): PriorityEntry {
  return PRIORITY_MAP[priority] ?? PRIORITY_MAP[TaskPriority.LOW];
}
function priorityLabel(priority: TaskPriority) {
  return (PRIORITY_MAP[priority] ?? PRIORITY_MAP[TaskPriority.LOW]).label;
}

function taskTicket(id: string) {
  return `TSK-${id.slice(0, 6).toUpperCase()}`;
}

// ── Data fetching ──────────────────────────────────────────────────────────
// TODO: replace mock with real API calls once BE is verified
async function loadData() {
  const apiClient = getApiClient();
  if (!apiClient) return;
  isLoading.value = true;
  try {
    // Sprints are always project-scoped — with no project selected (the
    // "Personal Workspace" state) there is no active sprint to show, so
    // skip the fetch rather than falling back to an arbitrary sprint from
    // some other project.
    if (!selectedProjectId.value) {
      activeSprint.value = null;
      tasks.value = [];
      members.value = [];
      return;
    }

    const sprintFilter: Record<string, string> = {
      status: SprintStatus.ACTIVE,
      projectId: selectedProjectId.value,
    };

    const sprints = await getSprints(apiClient, sprintFilter);
    activeSprint.value = sprints[0] ?? null;

    if (activeSprint.value) {
      const [sprintTasks, projectMembers] = await Promise.all([
        getTasks(apiClient, { sprintId: activeSprint.value.id }),
        selectedProjectId.value
          ? getProjectMembers(apiClient, selectedProjectId.value)
          : Promise.resolve([]),
      ]);
      // CLOSED tasks are obsoleted work — shown folded into the Done column
      // (see `columns`) rather than hidden entirely, and excluded from the
      // points total (see `totalPoints`).
      tasks.value = sprintTasks;
      members.value = projectMembers;
    } else {
      tasks.value = [];
      members.value = [];
    }
  } catch (err) {
    console.error("Failed to load sprint data:", err);
  } finally {
    isLoading.value = false;
  }
}

// ── Drag and drop ──────────────────────────────────────────────────────────
function handleDragStart(taskId: string, colId: TaskStatus) {
  draggingId.value = taskId;
  draggingFromCol.value = colId;
}

function handleDragEnd() {
  draggingId.value = null;
  draggingFromCol.value = null;
  dragOverCol.value = null;
}

function handleDragLeave(event: DragEvent, colId: TaskStatus) {
  const el = event.currentTarget as HTMLElement;
  if (el.contains(event.relatedTarget as Node | null)) return;
  if (dragOverCol.value === colId) dragOverCol.value = null;
}

async function handleDrop(targetColId: TaskStatus) {
  const taskId = draggingId.value;
  const fromCol = draggingFromCol.value;
  draggingId.value = null;
  draggingFromCol.value = null;
  dragOverCol.value = null;

  if (!taskId || fromCol === targetColId) return;

  const apiClient = getApiClient();
  const toastService = getToastService();
  if (!apiClient) return;

  const taskIdx = tasks.value.findIndex((t) => t.id === taskId);
  if (taskIdx === -1) return;

  const originalStatus = tasks.value[taskIdx].status;
  // Mutate the moved task in place rather than mapping the whole array —
  // avoids recomputing every derived stat/column for the n-1 unrelated tasks.
  tasks.value[taskIdx] = { ...tasks.value[taskIdx], status: targetColId };

  try {
    await updateTask(apiClient, taskId, { status: targetColId });
  } catch (err) {
    console.error("Failed to move task:", err);
    const rollbackIdx = tasks.value.findIndex((t) => t.id === taskId);
    if (rollbackIdx !== -1) {
      tasks.value[rollbackIdx] = {
        ...tasks.value[rollbackIdx],
        status: originalStatus,
      };
    }
    toastService?.error(t("toast.taskUpdateFailed"));
  }
}

// ── Task detail drawer ────────────────────────────────────────────────────
function selectTask(task: Task) {
  selectedTask.value = task;
  shouldShowTaskDetail.value = true;
}

function closeTaskDetail() {
  shouldShowTaskDetail.value = false;
}

// ── Task form ──────────────────────────────────────────────────────────────
function openCreateTask(colId?: TaskStatus) {
  taskFormInitialData.value = {
    sprintId: activeSprint.value?.id ?? null,
    projectId: selectedProjectId.value,
    status: colId ?? TaskStatus.TODO,
  };
  showTaskForm.value = true;
}

async function handleTaskFormSubmit(
  data: CreateTaskPayload | UpdateTaskPayload,
  isEdit: boolean,
) {
  const apiClient = getApiClient();
  const toastService = getToastService();

  if (!apiClient) {
    toastService?.error(t("toast.apiClientUnavailable"));
    return;
  }

  try {
    if (isEdit) {
      const { id: taskId, ...body } = data as UpdateTaskPayload;
      await updateTask(apiClient, taskId, body);
    } else {
      await createTask(apiClient, {
        ...(data as CreateTaskPayload),
        projectId: selectedProjectId.value,
        sprintId: activeSprint.value?.id ?? null,
      });
    }

    toastService?.success(
      isEdit ? t("toast.taskUpdated") : t("toast.taskCreated"),
    );
    showTaskForm.value = false;
    await loadData();
  } catch (err) {
    console.error("Task form submission failed:", err);
    toastService?.error(
      isEdit ? t("toast.taskUpdateFailed") : t("toast.taskCreateFailed"),
    );
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
watch(selectedProjectId, () => {
  loadData();
});

onMounted(() => {
  loadData();
});
</script>
