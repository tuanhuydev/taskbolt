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

  it("disables edit/delete controls for an active sprint", async () => {
    const activeSprint: Sprint = { ...mockSprint, status: SprintStatus.ACTIVE };
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [activeSprint], total: 1 }),
    } as Response);

    const wrapper = mountComponent("proj-1", true);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const lockedButtons = wrapper
      .find("li")
      .findAll('[title="taskbolt:sprint.activeSprintLocked"]');
    expect(lockedButtons).toHaveLength(2);
    lockedButtons.forEach((button) => {
      expect(button.attributes("disabled")).toBeDefined();
    });
  });

  it("shows an enabled 'mark as done' button for an active sprint past its endDate", async () => {
    const activeSprint: Sprint = {
      ...mockSprint,
      status: SprintStatus.ACTIVE,
      endDate: "2024-01-14", // fixed date in the past relative to any real clock
    };
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [activeSprint], total: 1 }),
    } as Response);

    const wrapper = mountComponent("proj-1", true);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const markDoneButton = wrapper.find('[title="taskbolt:sprint.markAsDone"]');
    expect(markDoneButton.exists()).toBe(true);
    expect(markDoneButton.attributes("disabled")).toBeUndefined();
  });

  it("hides the 'mark as done' button for an active sprint before its endDate", async () => {
    const activeSprint: Sprint = {
      ...mockSprint,
      status: SprintStatus.ACTIVE,
      endDate: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    };
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [activeSprint], total: 1 }),
    } as Response);

    const wrapper = mountComponent("proj-1", true);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[title="taskbolt:sprint.markAsDone"]').exists()).toBe(false);
  });

  it("hides the 'mark as done' button for a non-active sprint even if its endDate has passed", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [mockSprint], total: 1 }), // PLANNED, endDate 2024-01-14
    } as Response);

    const wrapper = mountComponent("proj-1", true);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[title="taskbolt:sprint.markAsDone"]').exists()).toBe(false);
  });

  it("leaves edit/delete controls enabled for a non-active sprint", async () => {
    vi.mocked(mockApiClient.request).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sprints: [mockSprint], total: 1 }),
    } as Response);

    const wrapper = mountComponent("proj-1", true);
    await new Promise((r) => setTimeout(r, 0));
    await wrapper.vm.$nextTick();

    const buttons = wrapper.find("li").findAll("button");
    buttons.forEach((button) => {
      expect(button.attributes("disabled")).toBeUndefined();
    });
  });
});
