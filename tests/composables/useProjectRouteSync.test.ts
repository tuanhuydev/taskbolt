import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { defineComponent, ref } from "vue";
import { useProjectRouteSync } from "@/shared/composables/useProjectRouteSync";
import { ProjectContextKey } from "@/shared/composables/useProject";

const HostPage = defineComponent({
  setup() {
    useProjectRouteSync();
    return () => null;
  },
});

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/:projectId?/backlogs", name: "backlogs", component: HostPage },
      { path: "/configure/:projectId?", name: "configure-home", component: { template: "<div />" } },
    ],
  });
}

function mountHost(router: ReturnType<typeof makeRouter>, selectedProjectId: string | null) {
  const projectContext = {
    selectedProjectId: ref<string | null>(selectedProjectId),
    setSelectedProjectId: vi.fn((id: string | null) => {
      projectContext.selectedProjectId.value = id;
    }),
  };
  const wrapper = mount(HostPage, {
    global: {
      plugins: [router],
      provide: { [ProjectContextKey as symbol]: projectContext },
    },
  });
  return { wrapper, projectContext };
}

describe("useProjectRouteSync", () => {
  it("selects the project from the URL when the route already has a projectId", async () => {
    const router = makeRouter();
    await router.push({ name: "backlogs", params: { projectId: "proj-1" } });

    const { projectContext } = mountHost(router, null);
    await router.isReady();

    expect(projectContext.setSelectedProjectId).toHaveBeenCalledWith("proj-1");
  });

  it("rewrites the URL to include the projectId when a project is already selected on mount", async () => {
    const router = makeRouter();
    await router.push({ name: "backlogs" });

    mountHost(router, "proj-1");
    await new Promise((r) => setTimeout(r, 0));

    expect(router.currentRoute.value.params.projectId).toBe("proj-1");
  });

  it("rewrites the URL when the selected project changes", async () => {
    const router = makeRouter();
    await router.push({ name: "backlogs" });

    const { projectContext } = mountHost(router, null);
    await new Promise((r) => setTimeout(r, 0));
    expect(router.currentRoute.value.params.projectId).toBeFalsy();

    projectContext.selectedProjectId.value = "proj-2";
    await new Promise((r) => setTimeout(r, 0));

    expect(router.currentRoute.value.params.projectId).toBe("proj-2");
  });

  it("clears the projectId from the URL when the project is deselected", async () => {
    const router = makeRouter();
    await router.push({ name: "backlogs", params: { projectId: "proj-1" } });

    const { projectContext } = mountHost(router, "proj-1");
    await new Promise((r) => setTimeout(r, 0));

    projectContext.selectedProjectId.value = null;
    await new Promise((r) => setTimeout(r, 0));

    expect(router.currentRoute.value.params.projectId).toBeFalsy();
  });
});
