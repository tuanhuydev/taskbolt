<template>
  <Drawer
    direction="right"
    :fixed="true"
    :dismissible="false"
    :open="(props.open as boolean) ?? false"
    @update:open="
      (isOpen) => {
        if (!isOpen) emits('close');
      }
    "
  >
    <DrawerContent class="w-full! max-w-full! sm:w-[720px]! sm:max-w-[92vw]!">
      <TaskDetailContent
        :task="task"
        :tasks="tasks"
        :members="props.members"
        :sprints="props.sprints"
        @close="emits('close')"
        @update="(data) => emits('update', data)"
        @create="(data) => emits('create', data)"
        @delete="(taskId) => emits('delete', taskId)"
      />
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { Drawer, DrawerContent } from "@/shared/components/ui/drawer";
import type { Task, CreateTaskPayload, UpdateTaskPayload } from "@/shared/types/task";
import type { ProjectMember } from "@/shared/types/member";
import type { Sprint } from "@/shared/types/sprint";
import TaskDetailContent from "./TaskDetailContent.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    task: Task | null;
    tasks: Task[];
    members?: ProjectMember[];
    sprints?: Sprint[];
  }>(),
  {
    members: () => [],
    sprints: () => [],
  },
);
const emits = defineEmits<{
  (e: "close"): void;
  (e: "update", data: UpdateTaskPayload): void;
  (e: "create", data: CreateTaskPayload): void;
  (e: "delete", taskId: string): void;
}>();
</script>
