import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import TaskDetailHeader from "@/features/backlogs/TaskDetailHeader.vue";
import { TaskType, type Task } from "@/shared/types/task";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div />" } },
    { path: "/tasks/:taskId", name: "task-link", component: { template: "<div />" } },
  ],
});

const task = { id: "task-abc123def456", type: TaskType.ISSUE } as Task;

function mountComponent() {
  return mount(TaskDetailHeader, {
    props: { task, isEditing: false, isSubTask: false },
    global: {
      plugins: [router],
      stubs: {
        Tooltip: { template: "<div><slot /><slot name='default' /></div>" },
        TooltipTrigger: { template: "<div><slot /></div>" },
        TooltipContent: true,
        DropdownMenu: true,
        DrawerHeader: { template: "<div><slot /></div>" },
        DrawerTitle: { template: "<div><slot /></div>" },
      },
    },
  });
}

describe("TaskDetailHeader — copy deep link", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("copies a /tasks/:taskId deep link (not the bare id) to the clipboard", async () => {
    await router.push("/");
    const wrapper = mountComponent();

    const idSpan = wrapper.find("span.cursor-pointer");
    await idSpan.trigger("click");
    await wrapper.vm.$nextTick();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(`/tasks/${task.id}`),
    );
  });
});
