import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
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

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/backlogs", name: "backlogs", component: BacklogsPage }],
});

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
      plugins: [router],
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

// Task titles render inside the task list's <h1> per TaskGroup.vue — scoping
// assertions to those avoids false substring matches against unrelated page
// text (e.g. untranslated i18n keys rendered raw in this test environment).
function taskTitles(wrapper: ReturnType<typeof mountComponent>): string[] {
  return wrapper.findAll("h1").map((el) => el.text());
}

describe("BacklogsPage — closed tasks filter", () => {
  it("hides closed tasks by default", async () => {
    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(taskTitles(wrapper)).toContain("Open task");
    expect(taskTitles(wrapper)).not.toContain("Closed task");
  });

  it("reveals closed tasks once the show-closed checkbox is checked", async () => {
    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const checkbox = wrapper.findComponent({ name: "CheckboxRoot" });
    await checkbox.vm.$emit("update:modelValue", true);
    await wrapper.vm.$nextTick();

    expect(taskTitles(wrapper)).toContain("Open task");
    expect(taskTitles(wrapper)).toContain("Closed task");
  });
});

const taskA = makeTask({ id: "task-a", title: "Task A" });
const taskB = makeTask({ id: "task-b", title: "Task B" });

function mockScopedApi() {
  vi.mocked(mockApiClient.request).mockImplementation(async (input) => {
    const url = String(input);
    if (url.includes("/tasks"))
      return { ok: true, json: async () => ({ tasks: [taskA, taskB], total: 2 }) } as Response;
    if (url.includes("/resource-grants")) return { ok: true, json: async () => [] } as Response;
    if (url.includes("/roles")) return { ok: true, json: async () => [] } as Response;
    if (url.includes("/users")) return { ok: true, json: async () => ({ users: [] }) } as Response;
    if (url.includes("/sprints")) return { ok: true, json: async () => ({ sprints: [], total: 0 }) } as Response;
    return { ok: true, json: async () => ({}) } as Response;
  });
}

function mountAt(path: string) {
  return router.push(path).then(() =>
    mount(BacklogsPage, {
      global: {
        plugins: [router],
        provide: {
          [SHELL_SERVICES_KEY as symbol]: mockShellServices,
          [ProjectContextKey as symbol]: {
            selectedProjectId: ref<string | null>(null),
            setSelectedProjectId: vi.fn(),
          },
        },
        stubs: { TaskForm: true },
      },
    }),
  );
}

describe("BacklogsPage — deep-linked task", () => {
  it("opens the task detail drawer for ?task=<id> once the list has loaded", async () => {
    mockScopedApi();
    const wrapper = await mountAt("/backlogs?task=task-b");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const taskDetail = wrapper.findComponent({ name: "TaskDetail" });
    expect(taskDetail.props("open")).toBe(true);
    expect(taskDetail.props("task")).toMatchObject({ id: "task-b" });
  });

  it("does not open any task detail when there is no task query param", async () => {
    mockScopedApi();
    const wrapper = await mountAt("/backlogs");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const taskDetail = wrapper.findComponent({ name: "TaskDetail" });
    expect(taskDetail.props("open")).toBe(false);
  });
});
