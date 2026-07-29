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

  it("re-opens the drawer for a new ?task=<id> without remounting the page", async () => {
    mockScopedApi();
    const wrapper = await mountAt("/backlogs?task=task-a");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    let taskDetail = wrapper.findComponent({ name: "TaskDetail" });
    expect(taskDetail.props("task")).toMatchObject({ id: "task-a" });

    await router.push("/backlogs?task=task-b");
    await wrapper.vm.$nextTick();

    taskDetail = wrapper.findComponent({ name: "TaskDetail" });
    expect(taskDetail.props("open")).toBe(true);
    expect(taskDetail.props("task")).toMatchObject({ id: "task-b" });
  });
});

describe("BacklogsPage — drag task to sprint", () => {
  const parentTask = makeTask({ id: "task-parent", title: "Parent Task", sprintId: null });
  const subTask = makeTask({
    id: "task-sub",
    title: "Sub Task",
    parentId: "task-parent",
    sprintId: null,
  });
  const sprintOne = {
    id: "sprint-1",
    name: "Sprint 1",
    projectId: "proj-1",
    status: "ACTIVE",
    startDate: null,
    endDate: null,
    goal: null,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  function mockDragDropApi() {
    vi.mocked(mockApiClient.request).mockImplementation(async (input, init) => {
      const url = String(input);
      const method = (init as RequestInit | undefined)?.method ?? "GET";
      if (method === "PATCH" && url.includes("/tasks/")) {
        return { ok: true, json: async () => ({}) } as Response;
      }
      if (url.includes("/tasks"))
        return {
          ok: true,
          json: async () => ({ tasks: [parentTask, subTask], total: 2 }),
        } as Response;
      if (url.includes("/sprints"))
        return { ok: true, json: async () => ({ sprints: [sprintOne], total: 1 }) } as Response;
      if (url.includes("/resource-grants")) return { ok: true, json: async () => [] } as Response;
      if (url.includes("/roles")) return { ok: true, json: async () => [] } as Response;
      if (url.includes("/users")) return { ok: true, json: async () => ({ users: [] }) } as Response;
      return { ok: true, json: async () => ({}) } as Response;
    });
  }

  function mountWithProject() {
    return mount(BacklogsPage, {
      global: {
        plugins: [router],
        provide: {
          [SHELL_SERVICES_KEY as symbol]: mockShellServices,
          [ProjectContextKey as symbol]: {
            selectedProjectId: ref<string | null>("proj-1"),
            setSelectedProjectId: vi.fn(),
          },
        },
        stubs: { TaskDetail: true, TaskForm: true },
      },
    });
  }

  function fakeDataTransfer(taskId: string) {
    const store: Record<string, string> = { "text/plain": taskId };
    return {
      effectAllowed: "",
      setData: (key: string, value: string) => {
        store[key] = value;
      },
      getData: (key: string) => store[key],
    };
  }

  it("moves a task (and its sub-tasks) to the sprint it's dropped on", async () => {
    mockDragDropApi();
    await router.push("/backlogs");
    const wrapper = mountWithProject();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const card = wrapper.find('[draggable="true"]');
    const dataTransfer = fakeDataTransfer("task-parent");
    await card.trigger("dragstart", { dataTransfer });

    const sprintRow = wrapper
      .findAll("li.mb-2")
      .find((li) => li.text().includes("Sprint 1"));
    expect(sprintRow).toBeTruthy();

    await sprintRow!.trigger("drop", { dataTransfer });
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));

    const patchCalls = vi
      .mocked(mockApiClient.request)
      .mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === "PATCH");

    expect(patchCalls).toHaveLength(2);
    const patchedIds = patchCalls.map(([url]) => String(url));
    expect(patchedIds.some((url) => url.includes("/tasks/task-parent"))).toBe(true);
    expect(patchedIds.some((url) => url.includes("/tasks/task-sub"))).toBe(true);
    for (const [, init] of patchCalls) {
      expect(JSON.parse((init as RequestInit).body as string)).toEqual({
        sprintId: "sprint-1",
      });
    }
  });

  it("does not send any request when dropped on the task's current sprint", async () => {
    mockDragDropApi();
    await router.push("/backlogs");
    const wrapper = mountWithProject();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    vi.mocked(mockApiClient.request).mockClear();

    const card = wrapper.find('[draggable="true"]');
    const dataTransfer = fakeDataTransfer("task-parent");
    await card.trigger("dragstart", { dataTransfer });

    // Backlog bucket is the task's current (null) sprint — dropping it back
    // there should be a no-op.
    const backlogRow = wrapper.findAll("li.mb-2").find((li) => !li.text().includes("Sprint 1"));
    await backlogRow!.trigger("drop", { dataTransfer });
    await wrapper.vm.$nextTick();

    expect(mockApiClient.request).not.toHaveBeenCalled();
  });
});
