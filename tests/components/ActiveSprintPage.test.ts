import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import ActiveSprintPage from "@/features/active-sprint/ActiveSprintPage.vue";
import { ProjectContextKey } from "@/shared/composables/useProject";
import { setupShellServices, teardownShellServices } from "../mocks/shell-services";
import { SprintStatus, type Sprint } from "@/shared/types/sprint";
import {
  TaskStatus,
  TaskType,
  TaskPriority,
  type Task,
} from "@/shared/types/task";

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

function mountComponent(selectedProjectId: string | null) {
  const projectContext = {
    selectedProjectId: ref<string | null>(selectedProjectId),
    setSelectedProjectId: vi.fn(),
  };
  return mount(ActiveSprintPage, {
    global: {
      provide: { [ProjectContextKey as symbol]: projectContext },
    },
  });
}

describe("ActiveSprintPage — CLOSED tasks are excluded from the board", () => {
  beforeEach(() => {
    setupShellServices();
    getSprintsMock.mockReset().mockResolvedValue([mockSprint]);
    getTasksMock.mockReset();
    getProjectMembersMock.mockReset().mockResolvedValue([]);
  });
  afterEach(() => teardownShellServices());

  it("does not render a CLOSED task in any column, and excludes its points from the sprint total", async () => {
    getTasksMock.mockResolvedValue([
      makeTask({ id: "t-open", title: "Open task", status: TaskStatus.TODO, storyPoint: 5 }),
      makeTask({ id: "t-closed", title: "Closed task", status: TaskStatus.CLOSED, storyPoint: 8 }),
    ]);

    const wrapper = mountComponent("proj-1");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Open task");
    expect(wrapper.text()).not.toContain("Closed task");
    // Only the open task's 5 points should count toward the total.
    expect(wrapper.text()).toContain("of 5 points completed");
  });
});
