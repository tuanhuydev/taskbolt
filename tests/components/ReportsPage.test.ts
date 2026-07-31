import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import { ref } from "vue";
import ReportsPage from "@/features/reports/ReportsPage.vue";
import { mockShellServices } from "../mocks/shell-services";
import { SHELL_SERVICES_KEY } from "@/shared/composables/useShellServices";
import { ProjectContextKey } from "@/shared/composables/useProject";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/:projectId?/reports", name: "reports", component: ReportsPage },
    { path: "/:projectId?/active-sprint", name: "active-sprint", component: { template: "<div />" } },
  ],
});

function mountComponent() {
  return mount(ReportsPage, {
    global: {
      plugins: [router],
      provide: {
        [SHELL_SERVICES_KEY as symbol]: mockShellServices,
        [ProjectContextKey as symbol]: {
          selectedProjectId: ref<string | null>(null),
          setSelectedProjectId: () => {},
        },
      },
    },
  });
}

describe("ReportsPage", () => {
  it("renders the header, sprint filter, KPI cards, charts, and task list", async () => {
    await router.push("/reports");
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("reports.title");
    expect(wrapper.text()).toContain("reports.filterSprint");
    expect(wrapper.text()).not.toContain("reports.filterProject");
    expect(wrapper.text()).not.toContain("reports.filterDateRange");

    expect(wrapper.text()).toContain("reports.kpiProgress");
    expect(wrapper.text()).toContain("reports.kpiTasksDone");
    expect(wrapper.text()).toContain("reports.kpiStoryPoints");
    expect(wrapper.text()).toContain("reports.kpiTimeLeft");

    expect(wrapper.text()).toContain("reports.burndownTitle");
    expect(wrapper.findAll("svg")).toHaveLength(1);

    expect(wrapper.text()).toContain("reports.breakdownTitle");
    expect(wrapper.text()).toContain("taskStatus.TODO");
    expect(wrapper.text()).toContain("taskStatus.IN_PROGRESS");
    expect(wrapper.text()).toContain("taskStatus.IN_REVIEW");
    expect(wrapper.text()).toContain("taskStatus.DONE");

    expect(wrapper.text()).toContain("reports.tasksTitle");
    expect(wrapper.text()).toContain("reports.viewBoard");
    expect(wrapper.text()).toContain("TB-142");
  });
});
