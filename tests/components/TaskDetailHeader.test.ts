import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import TaskDetailHeader from "@/shared/domain-ui/task/TaskDetailHeader.vue";
import { TaskType, type Task } from "@/shared/types/task";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div />" } },
    { path: "/tasks/:taskId", name: "task-link", component: { template: "<div />" } },
    {
      path: "/:projectId?/backlogs/:taskId",
      name: "task-detail",
      component: { template: "<div />" },
    },
  ],
});

const task = { id: "task-abc123def456", type: TaskType.ISSUE, projectId: null } as Task;

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
      },
    },
  });
}

describe("TaskDetailHeader — copy actions", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("copies the ticket number only (not a link) when clicking the task id", async () => {
    await router.push("/");
    const wrapper = mountComponent();

    const idSpan = wrapper.find("span.cursor-pointer");
    await idSpan.trigger("click");
    await wrapper.vm.$nextTick();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.not.stringContaining("/"),
    );
  });

  it("copies a full link to the dedicated task detail page from the Link button", async () => {
    await router.push("/");
    const wrapper = mountComponent();

    const linkButton = wrapper.find('[data-testid="copy-task-detail-link"]');
    await linkButton.trigger("click");
    await wrapper.vm.$nextTick();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(`/backlogs/${task.id}`),
    );
  });
});
