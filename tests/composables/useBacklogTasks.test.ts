import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { useBacklogTasks } from "@/shared/composables/useBacklogTasks";
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

function mountHost() {
  let result!: ReturnType<typeof useBacklogTasks>;
  const Host = defineComponent({
    setup() {
      result = useBacklogTasks(ref<string | null>(null));
      return () => null;
    },
  });
  mount(Host, {
    global: { provide: { [SHELL_SERVICES_KEY as symbol]: mockShellServices } },
  });
  return result;
}

describe("useBacklogTasks — stale response race", () => {
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
