import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import TaskFormFields from "@/features/backlogs/TaskFormFields.vue";
import { setupShellServices, teardownShellServices } from "../mocks/shell-services";
import { TaskType, TaskPriority, type Task } from "@/shared/types/task";

function mountComponent(initialData?: Partial<Task>) {
  return mount(TaskFormFields, {
    props: { initialData, sprints: [], members: [] },
  });
}

describe("TaskFormFields — sprint de-select", () => {
  beforeEach(() => setupShellServices());
  afterEach(() => teardownShellServices());

  it("hydrates the sprint select to the no-sprint sentinel when editing a task with no sprint", () => {
    const wrapper = mountComponent({
      id: "task-1",
      title: "Existing task",
      type: TaskType.STORY,
      priority: TaskPriority.MEDIUM,
      sprintId: null,
    });

    const vm = wrapper.vm as unknown as {
      formData: { sprintId: string };
      NO_SPRINT_VALUE: string;
    };
    expect(vm.formData.sprintId).toBe(vm.NO_SPRINT_VALUE);
  });

  it("hydrates the sprint select to the assigned sprint id when editing a task with a sprint", () => {
    const wrapper = mountComponent({
      id: "task-1",
      title: "Existing task",
      type: TaskType.STORY,
      priority: TaskPriority.MEDIUM,
      sprintId: "sprint-42",
    });

    const vm = wrapper.vm as unknown as { formData: { sprintId: string } };
    expect(vm.formData.sprintId).toBe("sprint-42");
  });

  it("emits sprintId: null (clearing it) when the no-sprint option is selected and the form is submitted", async () => {
    const wrapper = mountComponent({
      id: "task-1",
      title: "Existing task",
      type: TaskType.STORY,
      priority: TaskPriority.MEDIUM,
      sprintId: "sprint-42",
    });

    const vm = wrapper.vm as unknown as {
      formData: { sprintId: string };
      NO_SPRINT_VALUE: string;
    };
    // Simulate the user picking the "No sprint" SelectItem.
    vm.formData.sprintId = vm.NO_SPRINT_VALUE;

    const buttons = wrapper.findAll('button[type="button"]');
    await buttons[buttons.length - 1].trigger("click");

    const emitted = wrapper.emitted("submit");
    expect(emitted).toBeTruthy();
    const [payload, isEdit] = emitted![0];
    expect(isEdit).toBe(true);
    expect((payload as { sprintId?: string | null }).sprintId).toBeNull();
  });

  it("still sends the chosen sprint id through unchanged when one is selected", async () => {
    const wrapper = mountComponent({
      id: "task-1",
      title: "Existing task",
      type: TaskType.STORY,
      priority: TaskPriority.MEDIUM,
      sprintId: null,
    });

    const vm = wrapper.vm as unknown as { formData: { sprintId: string } };
    vm.formData.sprintId = "sprint-7";

    const buttons = wrapper.findAll('button[type="button"]');
    await buttons[buttons.length - 1].trigger("click");

    const emitted = wrapper.emitted("submit");
    const [payload] = emitted![0];
    expect((payload as { sprintId?: string | null }).sprintId).toBe("sprint-7");
  });
});
