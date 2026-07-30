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
  it("renders the header, filter controls, and stat cards", async () => {
    await router.push("/reports");
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("reports.title");
    expect(wrapper.text()).toContain("reports.filterSprint");
    expect(wrapper.text()).not.toContain("reports.filterProject");
    expect(wrapper.text()).not.toContain("reports.filterDateRange");
    expect(wrapper.text()).toContain("Total Tasks");
    expect(wrapper.text()).toContain("Completed");
    expect(wrapper.text()).toContain("In Progress");
    expect(wrapper.text()).toContain("Story Points");
  });
});
