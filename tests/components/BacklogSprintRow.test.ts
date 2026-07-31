import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BacklogSprintRow from "@/features/backlogs/BacklogSprintRow.vue";
import { mockShellServices } from "../mocks/shell-services";
import { SHELL_SERVICES_KEY } from "@/shared/composables/useShellServices";
import { SprintStatus, type Sprint } from "@/shared/types/sprint";
import { TaskType, TaskStatus, TaskPriority, type Task } from "@/shared/types/task";

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

const mockTask: Task = {
  id: "task-1",
  title: "A task",
  description: "",
  type: TaskType.ISSUE,
  priority: TaskPriority.MEDIUM,
  storyPoint: 0,
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
};

function mountComponent(sprint: Sprint | null) {
  return mount(BacklogSprintRow, {
    props: {
      sprint,
      tasks: [mockTask],
      subTaskMap: new Map(),
      activeTaskId: null,
    },
    global: {
      provide: { [SHELL_SERVICES_KEY as symbol]: mockShellServices },
    },
  });
}

describe("BacklogSprintRow", () => {
  it("keeps the unscheduled backlog bucket always open with no toggle control", () => {
    const wrapper = mountComponent(null);

    expect(wrapper.text()).toContain("A task");
    // No chevron/toggle button for the unscheduled bucket.
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("defaults a sprint row open and toggles it closed on click", async () => {
    const wrapper = mountComponent(mockSprint);

    expect(wrapper.text()).toContain("A task");

    const header = wrapper.find('[class*="cursor-pointer"]');
    await header.trigger("click");

    expect(wrapper.text()).not.toContain("A task");
  });

  it("toggles a sprint row back open via the chevron button", async () => {
    const wrapper = mountComponent(mockSprint);

    const toggleButton = wrapper.find("button");
    expect(toggleButton.exists()).toBe(true);

    await toggleButton.trigger("click");
    expect(wrapper.text()).not.toContain("A task");

    await toggleButton.trigger("click");
    expect(wrapper.text()).toContain("A task");
  });
});
