import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { useBacklogTasks } from "@/shared/composables/useBacklogTasks";
import { mockApiClient, mockShellServices } from "../mocks/shell-services";
import { SHELL_SERVICES_KEY } from "@/shared/composables/useShellServices";
import { TaskStatus, TaskType, TaskPriority, type Task } from "@/shared/types/task";
import * as services from "@/shared/services";

// Only members/sprints are mocked at the services layer here — getTasks is
// left as the real implementation (calling through to apiClient.request) so
// the stale-response race test below can control response timing directly.
vi.mock("@/shared/services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/services")>();
  return {
    ...actual,
    getProjectMembers: vi.fn(async () => []),
    getSprints: vi.fn(async () => []),
  };
});

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
      result = useBacklogTasks(ref<string | null>("project-1"));
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

describe("useBacklogTasks — secondary fetch failures", () => {
  it("exposes membersError without clobbering a successful sprints fetch", async () => {
    vi.mocked(services.getProjectMembers).mockRejectedValueOnce(new Error("members boom"));
    vi.mocked(services.getSprints).mockResolvedValueOnce([]);

    const { fetchMembersAndSprints, membersError, sprintsError } = mountHost();
    await fetchMembersAndSprints();

    expect(membersError.value).toBe("members boom");
    expect(sprintsError.value).toBeNull();
  });

  it("exposes sprintsError without clobbering a successful members fetch", async () => {
    vi.mocked(services.getProjectMembers).mockResolvedValueOnce([]);
    vi.mocked(services.getSprints).mockRejectedValueOnce(new Error("sprints boom"));

    const { fetchMembersAndSprints, membersError, sprintsError } = mountHost();
    await fetchMembersAndSprints();

    expect(sprintsError.value).toBe("sprints boom");
    expect(membersError.value).toBeNull();
  });

  it("clears previous errors on a subsequent successful fetch", async () => {
    vi.mocked(services.getProjectMembers).mockRejectedValueOnce(new Error("members boom"));
    vi.mocked(services.getSprints).mockResolvedValueOnce([]);

    const { fetchMembersAndSprints, membersError } = mountHost();
    await fetchMembersAndSprints();
    expect(membersError.value).toBe("members boom");

    vi.mocked(services.getProjectMembers).mockResolvedValueOnce([]);
    await fetchMembersAndSprints();
    expect(membersError.value).toBeNull();
  });
});
