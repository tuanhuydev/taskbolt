import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { ref } from "vue";
import ActiveSprintPage from "@/features/active-sprint/ActiveSprintPage.vue";
import { ProjectContextKey } from "@/shared/composables/useProject";
import { setupShellServices, teardownShellServices, mockApiClient } from "../mocks/shell-services";
import { SprintStatus, type Sprint } from "@/shared/types/sprint";
import {
  TaskStatus,
  TaskType,
  TaskPriority,
  type Task,
} from "@/shared/types/task";

const { getSprintsMock, getTasksMock, getProjectMembersMock, createTaskMock, updateTaskMock } =
  vi.hoisted(() => ({
    getSprintsMock: vi.fn(),
    getTasksMock: vi.fn(),
    getProjectMembersMock: vi.fn(),
    createTaskMock: vi.fn(),
    updateTaskMock: vi.fn(),
  }));

vi.mock("@/shared/services", () => ({
  getSprints: getSprintsMock,
  getTasks: getTasksMock,
  getProjectMembers: getProjectMembersMock,
  createTask: createTaskMock,
  updateTask: updateTaskMock,
}));

const mockSprint: Sprint = {
  id: "sprint-1",
  name: "Sprint 1",
  projectId: "proj-1",
  status: SprintStatus.ACTIVE,
  startDate: "2024-01-01",
  endDate: "2024-01-14",
  goal: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    title: "Untitled",
    description: "",
    type: TaskType.ISSUE,
    priority: TaskPriority.MEDIUM,
    storyPoint: 3,
    assigneeId: null,
    parentId: null,
    status: TaskStatus.TODO,
    createdById: "user-1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    deletedAt: null,
    projectId: "proj-1",
    subTasks: [],
    sprintId: "sprint-1",
    ...overrides,
  };
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/:projectId?/active-sprint", name: "active-sprint", component: ActiveSprintPage }],
});

async function mountComponent(selectedProjectId: string | null) {
  const projectContext = {
    selectedProjectId: ref<string | null>(selectedProjectId),
    setSelectedProjectId: vi.fn(),
  };
  await router.push({ name: "active-sprint" });
  return mount(ActiveSprintPage, {
    global: {
      plugins: [router],
      provide: { [ProjectContextKey as symbol]: projectContext },
    },
  });
}

describe("ActiveSprintPage — CLOSED tasks fold into the Done column", () => {
  beforeEach(() => {
    setupShellServices();
    getSprintsMock.mockReset().mockResolvedValue([mockSprint]);
    getTasksMock.mockReset();
    getProjectMembersMock.mockReset().mockResolvedValue([]);
  });
  afterEach(() => teardownShellServices());

  it("renders a CLOSED task inside the Done column and excludes its points from the sprint total", async () => {
    getTasksMock.mockResolvedValue([
      makeTask({ id: "t-open", title: "Open task", status: TaskStatus.TODO, storyPoint: 5 }),
      makeTask({ id: "t-closed", title: "Closed task", status: TaskStatus.CLOSED, storyPoint: 8 }),
    ]);

    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Open task");
    // Still visible on the board — folded into Done rather than hidden.
    expect(wrapper.text()).toContain("Closed task");
    expect(wrapper.text()).toContain("taskStatus.CLOSED");
    // Only the open task's 5 points should count toward the total.
    expect(wrapper.text()).toContain("of 5 points completed");

    // Index 0 is the sprint progress stats block (matches the same class
    // list incidentally); columns follow in TODO, In progress, Done order.
    const doneColumn = wrapper.findAll(".flex-1.min-w-0.flex.flex-col")[3];
    expect(doneColumn.text()).toContain("Closed task");
  });

  it("is a no-op drag when a CLOSED task is dropped back into Done (still folded from the same column)", async () => {
    getTasksMock.mockResolvedValue([
      makeTask({ id: "t-closed", title: "Closed task", status: TaskStatus.CLOSED, storyPoint: 8 }),
    ]);
    vi.mocked(mockApiClient.request).mockReset();

    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const card = wrapper.find('[draggable="true"]');
    await card.trigger("dragstart");
    const doneColumn = wrapper.findAll(".flex-1.min-w-0.flex.flex-col")[3];
    await doneColumn.trigger("drop");
    await wrapper.vm.$nextTick();

    // Dragged card's source column is Done (where CLOSED tasks render) and
    // the drop target is also Done — same column, so no PATCH is sent and
    // the task's own CLOSED status is left untouched.
    expect(mockApiClient.request).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Closed task");
  });
});

describe("ActiveSprintPage — Done column has no add-task shortcut", () => {
  beforeEach(() => {
    setupShellServices();
    getSprintsMock.mockReset().mockResolvedValue([mockSprint]);
    getTasksMock.mockReset().mockResolvedValue([]);
    getProjectMembersMock.mockReset().mockResolvedValue([]);
  });
  afterEach(() => teardownShellServices());

  it("offers an add-task button in To do and In progress, but not in Done", async () => {
    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const columns = wrapper.findAll(".flex-1.min-w-0.flex.flex-col").slice(1);
    expect(columns).toHaveLength(3);

    const [todoCol, inProgressCol, doneCol] = columns;
    expect(todoCol.text()).toContain("To do");
    expect(todoCol.findAll('button[class*="border-dashed"]')).toHaveLength(1);

    expect(inProgressCol.text()).toContain("In progress");
    expect(inProgressCol.findAll('button[class*="border-dashed"]')).toHaveLength(1);

    expect(doneCol.text()).toContain("Done");
    expect(doneCol.findAll('button[class*="border-dashed"]')).toHaveLength(0);
  });
});

describe("ActiveSprintPage — project scoping", () => {
  beforeEach(() => {
    setupShellServices();
    getSprintsMock.mockReset().mockResolvedValue([mockSprint]);
    getTasksMock.mockReset().mockResolvedValue([]);
    getProjectMembersMock.mockReset().mockResolvedValue([]);
  });
  afterEach(() => teardownShellServices());

  it("does not fetch or show any sprint when no project is selected", async () => {
    const wrapper = await mountComponent(null);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(getSprintsMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("activeSprint.selectProjectPrompt");
  });

  it("fetches the active sprint scoped to the selected project", async () => {
    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(getSprintsMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: SprintStatus.ACTIVE, projectId: "proj-1" }),
    );
    expect(wrapper.text()).toContain("Sprint 1");
  });

  it("re-fetches scoped to the new project when the selected project changes", async () => {
    const projectContext = {
      selectedProjectId: ref<string | null>("proj-1"),
      setSelectedProjectId: vi.fn(),
    };
    await router.push({ name: "active-sprint" });
    const wrapper = mount(ActiveSprintPage, {
      global: {
        plugins: [router],
        provide: { [ProjectContextKey as symbol]: projectContext },
      },
    });
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    getSprintsMock.mockClear();
    projectContext.selectedProjectId.value = "proj-2";
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(getSprintsMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ projectId: "proj-2" }),
    );
  });
});

describe("ActiveSprintPage — drag-and-drop task move", () => {
  beforeEach(() => {
    setupShellServices();
    getSprintsMock.mockReset().mockResolvedValue([mockSprint]);
    getTasksMock.mockReset();
    getProjectMembersMock.mockReset().mockResolvedValue([]);
    updateTaskMock.mockReset();
  });
  afterEach(() => teardownShellServices());

  it("optimistically moves the task and does not refetch the task list on success", async () => {
    getTasksMock.mockResolvedValue([
      makeTask({ id: "t-1", title: "Movable task", status: TaskStatus.TODO }),
    ]);
    updateTaskMock.mockResolvedValue(
      makeTask({ id: "t-1", title: "Movable task", status: TaskStatus.IN_PROGRESS }),
    );

    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(getTasksMock).toHaveBeenCalledTimes(1);

    const card = wrapper.find('[draggable="true"]');
    await card.trigger("dragstart");
    const inProgressColumn = wrapper.findAll(".flex-1.min-w-0.flex.flex-col")[2];
    await inProgressColumn.trigger("drop");
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(updateTaskMock).toHaveBeenCalledWith(expect.anything(), "t-1", {
      status: TaskStatus.IN_PROGRESS,
    });
    // No refetch after a successful drag — the composable's write methods
    // don't auto-refresh, so the optimistic in-place update stands alone.
    expect(getTasksMock).toHaveBeenCalledTimes(1);
    expect(inProgressColumn.text()).toContain("Movable task");
  });

  it("rolls back the optimistic move if the update request fails", async () => {
    getTasksMock.mockResolvedValue([
      makeTask({ id: "t-1", title: "Movable task", status: TaskStatus.TODO }),
    ]);
    updateTaskMock.mockRejectedValue(new Error("boom"));

    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const card = wrapper.find('[draggable="true"]');
    await card.trigger("dragstart");
    const inProgressColumn = wrapper.findAll(".flex-1.min-w-0.flex.flex-col")[2];
    await inProgressColumn.trigger("drop");
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const todoColumn = wrapper.findAll(".flex-1.min-w-0.flex.flex-col")[1];
    expect(todoColumn.text()).toContain("Movable task");
    expect(inProgressColumn.text()).not.toContain("Movable task");
  });
});
