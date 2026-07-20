import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import BacklogsPage from "@/features/backlogs/BacklogsPage.vue";
import { mockApiClient, mockShellServices } from "../mocks/shell-services";
import { SHELL_SERVICES_KEY } from "@/shared/composables/useShellServices";
import { ProjectContextKey } from "@/shared/composables/useProject";
import {
  TaskStatus,
  TaskType,
  TaskPriority,
  type Task,
} from "@/shared/types/task";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: "task-1",
    title: "Untitled",
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
    projectId: null,
    subTasks: [],
    sprintId: null,
    ...overrides,
  };
}

const openTask = makeTask({ id: "task-open", title: "Open task" });
const closedTask = makeTask({
  id: "task-closed",
  title: "Closed task",
  status: TaskStatus.CLOSED,
});

function mountComponent() {
  vi.mocked(mockApiClient.request).mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes("/tasks"))
      return {
        ok: true,
        json: async () => ({ tasks: [openTask, closedTask], total: 2 }),
      } as Response;
    if (url.includes("/resource-grants")) return { ok: true, json: async () => [] } as Response;
    if (url.includes("/roles")) return { ok: true, json: async () => [] } as Response;
    if (url.includes("/users")) return { ok: true, json: async () => ({ users: [] }) } as Response;
    if (url.includes("/sprints")) return { ok: true, json: async () => ({ sprints: [], total: 0 }) } as Response;
    return { ok: true, json: async () => ({}) } as Response;
  });

  return mount(BacklogsPage, {
    global: {
      provide: {
        [SHELL_SERVICES_KEY as symbol]: mockShellServices,
        [ProjectContextKey as symbol]: {
          selectedProjectId: ref<string | null>(null),
          setSelectedProjectId: vi.fn(),
        },
      },
      stubs: { TaskDetail: true, TaskForm: true },
    },
  });
}

describe("BacklogsPage — closed tasks filter", () => {
  it("hides closed tasks by default", async () => {
    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Open task");
    expect(wrapper.text()).not.toContain("Closed task");
  });

  it("reveals closed tasks once the show-closed checkbox is checked", async () => {
    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const checkbox = wrapper.findComponent({ name: "CheckboxRoot" });
    await checkbox.vm.$emit("update:modelValue", true);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Open task");
    expect(wrapper.text()).toContain("Closed task");
  });
});
