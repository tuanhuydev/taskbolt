import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { ref } from "vue";
import ReportsPage from "@/features/reports/ReportsPage.vue";
import { ProjectContextKey } from "@/shared/composables/useProject";
import { setupShellServices, teardownShellServices } from "../mocks/shell-services";
import { SprintStatus, type Sprint } from "@/shared/types/sprint";
import { TaskStatus, TaskType, TaskPriority, type Task } from "@/shared/types/task";
import type { ProjectMember } from "@/shared/types/member";

const { getSprintsMock, getTasksMock, getProjectMembersMock } = vi.hoisted(() => ({
  getSprintsMock: vi.fn(),
  getTasksMock: vi.fn(),
  getProjectMembersMock: vi.fn(),
}));

vi.mock("@/shared/services", () => ({
  getSprints: getSprintsMock,
  getTasks: getTasksMock,
  getProjectMembers: getProjectMembersMock,
}));

const activeSprint: Sprint = {
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

const member: ProjectMember = {
  userId: "user-1",
  userName: "Jordan Lee",
  role: "MEMBER",
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
  routes: [
    { path: "/:projectId?/reports", name: "reports", component: ReportsPage },
    { path: "/:projectId?/active-sprint", name: "active-sprint", component: { template: "<div />" } },
  ],
});

async function mountComponent(selectedProjectId: string | null) {
  const projectContext = {
    selectedProjectId: ref<string | null>(selectedProjectId),
    setSelectedProjectId: vi.fn(),
  };
  await router.push({ name: "reports" });
  return mount(ReportsPage, {
    global: {
      plugins: [router],
      provide: { [ProjectContextKey as symbol]: projectContext },
    },
  });
}

describe("ReportsPage", () => {
  beforeEach(() => {
    setupShellServices();
    getSprintsMock.mockReset().mockResolvedValue([activeSprint]);
    getTasksMock.mockReset();
    getProjectMembersMock.mockReset().mockResolvedValue([member]);
  });
  afterEach(() => teardownShellServices());

  it("defaults to the active sprint and renders real KPI, breakdown, and task data", async () => {
    getTasksMock.mockResolvedValue([
      makeTask({ id: "t-todo", title: "Todo task", status: TaskStatus.TODO, storyPoint: 5 }),
      makeTask({
        id: "t-done",
        title: "Done task",
        status: TaskStatus.DONE,
        storyPoint: 8,
        assigneeId: "user-1",
      }),
      makeTask({
        id: "t-closed",
        title: "Closed task",
        status: TaskStatus.CLOSED,
        storyPoint: 100,
      }),
    ]);

    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(getSprintsMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ projectId: "proj-1" }),
    );
    expect(getTasksMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ sprintId: "sprint-1" }),
    );

    // Story points: done=8, total=5+8=13 (closed task's 100 excluded).
    expect(wrapper.text()).toContain("8");
    expect(wrapper.text()).toContain("/13");
    // Tasks done: 1 of 2 (closed excluded from the denominator too).
    expect(wrapper.text()).toContain("/2");

    expect(wrapper.text()).toContain("Todo task");
    expect(wrapper.text()).toContain("Done task");
    expect(wrapper.text()).not.toContain("Closed task");
    expect(wrapper.text()).toContain("Jordan Lee");

    expect(wrapper.text()).toContain("taskStatus.TODO");
    expect(wrapper.text()).toContain("taskStatus.DONE");
  });

  it("shows the empty state when the project has no sprints", async () => {
    getSprintsMock.mockResolvedValue([]);
    getTasksMock.mockResolvedValue([]);

    const wrapper = await mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("reports.noSprints");
  });
});
