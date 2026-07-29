import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { useProjectTasks } from "@/shared/composables/useProjectTasks";
import { mockApiClient, mockShellServices } from "../mocks/shell-services";
import { SHELL_SERVICES_KEY } from "@/shared/composables/useShellServices";
import { TaskStatus, TaskType, TaskPriority, type Task } from "@/shared/types/task";

function makeTask(id: string, title: string): Task {
  return {
    id,
    title,
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
  };
}

function mountHost(sprintId?: ReturnType<typeof ref<string | null>>) {
  let result!: ReturnType<typeof useProjectTasks>;
  const Host = defineComponent({
    setup() {
      result = useProjectTasks(ref<string | null>("project-1"), sprintId ? { sprintId } : {});
      return () => null;
    },
  });
  mount(Host, {
    global: { provide: { [SHELL_SERVICES_KEY as symbol]: mockShellServices } },
  });
  return result;
}

describe("useProjectTasks — stale response race", () => {
  it("keeps the newest fetchTasks result even if an older request resolves later", async () => {
    const oldTasks = [makeTask("old-1", "Old")];
    const newTasks = [makeTask("new-1", "New")];

    let resolveOld!: (value: Response) => void;
    const oldPromise = new Promise<Response>((resolve) => {
      resolveOld = resolve;
    });

    vi.mocked(mockApiClient.request).mockImplementationOnce(() => oldPromise);

    const { taskList, fetchTasks } = mountHost();

    const firstCall = fetchTasks(); // slow, in-flight

    vi.mocked(mockApiClient.request).mockImplementationOnce(
      async () =>
        ({ ok: true, json: async () => ({ tasks: newTasks, total: 1 }) }) as Response,
    );

    const secondCall = fetchTasks(); // fast, resolves before the first
    await secondCall;

    expect(taskList.value).toEqual(newTasks);

    // Stale response for the first (superseded) request lands after the fact.
    resolveOld({ ok: true, json: async () => ({ tasks: oldTasks, total: 1 }) } as Response);
    await firstCall;

    expect(taskList.value).toEqual(newTasks);
  });
});

describe("useProjectTasks — sprintId scoping", () => {
  beforeEach(() => {
    vi.mocked(mockApiClient.request).mockReset();
  });

  it("clears the task list and skips fetching when sprintId is unset", async () => {
    const sprintId = ref<string | null>(null);
    const { fetchTasks, taskList, loading } = mountHost(sprintId);

    await fetchTasks();

    expect(taskList.value).toEqual([]);
    expect(loading.value).toBe(false);
    expect(mockApiClient.request).not.toHaveBeenCalled();
  });

  it("includes sprintId in the fetch filter once set", async () => {
    const sprintId = ref<string | null>("sprint-1");
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [], total: 0 }),
    } as Response);

    const { fetchTasks } = mountHost(sprintId);
    await fetchTasks();

    expect(mockApiClient.request).toHaveBeenCalledWith(
      expect.stringContaining("sprintId=sprint-1"),
      expect.any(Object),
    );
  });
});

describe("useProjectTasks — write orchestration", () => {
  beforeEach(() => {
    vi.mocked(mockApiClient.request).mockReset();
  });

  it("createTask calls the API and returns the created task without refetching", async () => {
    const created = makeTask("new-task", "New Task");
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => created,
    } as Response);

    const { createTask, taskList } = mountHost();
    const result = await createTask({ title: "New Task", type: TaskType.ISSUE });

    expect(result).toEqual(created);
    // No refetch: callers that want the list refreshed call fetchTasks()
    // themselves; callers doing an optimistic update apply the result
    // directly instead of paying for a round-trip.
    expect(taskList.value).toEqual([]);
    expect(mockApiClient.request).toHaveBeenCalledTimes(1);
  });

  it("updateTask calls the API and returns the updated task without refetching", async () => {
    const updated = makeTask("task-1", "Updated Title");
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => updated,
    } as Response);

    const { updateTask, taskList } = mountHost();
    const result = await updateTask("task-1", { title: "Updated Title" });

    expect(result).toEqual(updated);
    expect(taskList.value).toEqual([]);
    expect(mockApiClient.request).toHaveBeenCalledTimes(1);
  });

  it("createTask rejects when the create request fails", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    const { createTask } = mountHost();
    await expect(createTask({ title: "", type: TaskType.ISSUE })).rejects.toThrow();
    expect(mockApiClient.request).toHaveBeenCalledTimes(1);
  });
});
