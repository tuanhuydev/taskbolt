import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import TaskLinkPage from "@/features/backlogs/TaskLinkPage.vue";
import { mockApiClient, mockShellServices } from "../mocks/shell-services";
import { SHELL_SERVICES_KEY } from "@/shared/composables/useShellServices";
import { ProjectContextKey } from "@/shared/composables/useProject";
import { ref } from "vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/tasks/:taskId", name: "task-link", component: TaskLinkPage },
    { path: "/backlogs", name: "backlogs", component: { template: "<div />" } },
  ],
});

function mountAt(path: string, setSelectedProjectId = vi.fn()) {
  return router.push(path).then(() =>
    mount(TaskLinkPage, {
      global: {
        plugins: [router],
        provide: {
          [SHELL_SERVICES_KEY as symbol]: mockShellServices,
          [ProjectContextKey as symbol]: {
            selectedProjectId: ref<string | null>(null),
            setSelectedProjectId,
          },
        },
      },
    }),
  );
}

describe("TaskLinkPage", () => {
  beforeEach(() => {
    vi.mocked(mockApiClient.request).mockReset();
  });

  it("resolves the task, sets the shared project context, and redirects to Backlogs with the task pre-selected", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "task-1", projectId: "proj-1" }),
    } as Response);
    const setSelectedProjectId = vi.fn();

    await mountAt("/tasks/task-1", setSelectedProjectId);
    await new Promise((r) => setTimeout(r, 0));

    expect(setSelectedProjectId).toHaveBeenCalledWith("proj-1");
    expect(router.currentRoute.value.name).toBe("backlogs");
    expect(router.currentRoute.value.query.task).toBe("task-1");
  });

  it("shows an error and does not redirect when the task can't be resolved", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);

    const wrapper = await mountAt("/tasks/missing");
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(router.currentRoute.value.name).toBe("task-link");
    expect(wrapper.text()).toContain("taskLink.notFound");
  });
});
