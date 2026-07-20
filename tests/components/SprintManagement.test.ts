import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import SprintManagement from "@/features/projects/SprintManagement.vue";
import {
  mockApiClient,
  mockToastService,
  mockShellServices,
} from "../mocks/shell-services";
import { SprintStatus, type Sprint } from "@/shared/types/sprint";
import { SHELL_SERVICES_KEY } from "@/shared/composables/useShellServices";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/", component: { template: "<div />" } }],
});

const mockSprint: Sprint = {
  id: "sprint-1",
  name: "Sprint 1",
  projectId: "proj-1",
  status: SprintStatus.PLANNED,
  startDate: "2024-01-01",
  endDate: "2024-01-14",
  goal: "Deliver MVP",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

function mountComponent(projectId = "proj-1", isAdmin = false) {
  return mount(SprintManagement, {
    props: { projectId, isAdmin },
    global: {
      plugins: [router],
      provide: { [SHELL_SERVICES_KEY as symbol]: mockShellServices },
      stubs: {
        SprintForm: true,
        Drawer: { template: "<div><slot /></div>" },
        DrawerContent: { template: "<div><slot /></div>" },
      },
    },
  });
}

describe("SprintManagement", () => {
  it("shows loading state initially", () => {
    vi.mocked(mockApiClient.request).mockReturnValue(new Promise(() => {}));
    const wrapper = mountComponent();
    expect(wrapper.text()).toContain("common.loading");
  });

  it("renders sprints after loading", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [mockSprint], total: 1 }),
    } as Response);

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Sprint 1");
    expect(wrapper.text()).toContain("Deliver MVP");
  });

  it("shows empty message when no sprints", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [], total: 0 }),
    } as Response);

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("sprint.noSprints");
  });

  it("shows the Add Sprint button", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [], total: 0 }),
    } as Response);

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("sprint.addSprint");
  });

  it("shows error on API failure", async () => {
    vi.mocked(mockApiClient.request).mockRejectedValueOnce(
      new Error("Sprint fetch error"),
    );

    const wrapper = mountComponent();
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Sprint fetch error");
  });

  it("hides per-sprint edit/delete controls when isAdmin is false (the default)", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [mockSprint], total: 1 }),
    } as Response);

    const wrapper = mountComponent("proj-1", false);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const sprintRow = wrapper.find("li");
    expect(sprintRow.findAll("button")).toHaveLength(0);
  });

  it("shows per-sprint edit/delete controls when isAdmin is true", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [mockSprint], total: 1 }),
    } as Response);

    const wrapper = mountComponent("proj-1", true);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const sprintRow = wrapper.find("li");
    expect(sprintRow.findAll("button")).toHaveLength(2);
  });
});
