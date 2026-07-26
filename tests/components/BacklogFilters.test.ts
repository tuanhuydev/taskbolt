import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BacklogFilters from "@/features/backlogs/BacklogFilters.vue";
import { TaskStatus, TaskPriority } from "@/shared/types/task";

function mountComponent(
  props: { statuses: TaskStatus[]; priorities: TaskPriority[] } = {
    statuses: [],
    priorities: [],
  },
) {
  return mount(BacklogFilters, {
    props,
    global: {
      stubs: {
        DropdownMenu: { template: "<div><slot /></div>" },
        DropdownMenuTrigger: { template: "<div><slot /></div>" },
        DropdownMenuContent: { template: "<div><slot /></div>" },
        DropdownMenuLabel: { template: "<div><slot /></div>" },
        DropdownMenuSeparator: true,
      },
    },
  });
}

describe("BacklogFilters", () => {
  it("emits the added status when an unchecked status is toggled", async () => {
    const wrapper = mountComponent({ statuses: [TaskStatus.TODO], priorities: [] });

    const checkboxes = wrapper.findAllComponents({ name: "CheckboxRoot" });
    // First group of checkboxes corresponds to statusOptions, in enum order.
    const inProgressIndex = Object.values(TaskStatus).indexOf(TaskStatus.IN_PROGRESS);
    await checkboxes[inProgressIndex].vm.$emit("update:modelValue", true);

    const emitted = wrapper.emitted("update:statuses");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual([TaskStatus.TODO, TaskStatus.IN_PROGRESS]);
  });

  it("emits the status removed when an already-checked status is toggled off", async () => {
    const wrapper = mountComponent({
      statuses: [TaskStatus.TODO, TaskStatus.DONE],
      priorities: [],
    });

    const checkboxes = wrapper.findAllComponents({ name: "CheckboxRoot" });
    const todoIndex = Object.values(TaskStatus).indexOf(TaskStatus.TODO);
    await checkboxes[todoIndex].vm.$emit("update:modelValue", false);

    const emitted = wrapper.emitted("update:statuses");
    expect(emitted![0][0]).toEqual([TaskStatus.DONE]);
  });

  it("clears both dimensions when 'clear filters' is clicked", async () => {
    const wrapper = mountComponent({
      statuses: [TaskStatus.TODO],
      priorities: [TaskPriority.HIGH],
    });

    const clearButton = wrapper.findAll("button").find((b) => b.text().includes("clearFilters"));
    expect(clearButton).toBeTruthy();
    await clearButton!.trigger("click");

    expect(wrapper.emitted("update:statuses")![0][0]).toEqual([]);
    expect(wrapper.emitted("update:priorities")![0][0]).toEqual([]);
  });

  it("does not render a clear-filters button when nothing is selected", () => {
    const wrapper = mountComponent();
    const clearButton = wrapper.findAll("button").find((b) => b.text().includes("clearFilters"));
    expect(clearButton).toBeUndefined();
  });
});
