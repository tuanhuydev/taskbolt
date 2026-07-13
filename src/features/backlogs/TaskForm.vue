<template>
  <Drawer
    direction="right"
    :fixed="true"
    :dismissible="false"
    :open="props.open"
    @update:open="handleDrawerUpdate"
  >
    <DrawerContent class="w-150">
      <DrawerHeader>
        <DrawerTitle>{{
          isEditMode ? t("taskForm.editTitle") : t("taskForm.createTitle")
        }}</DrawerTitle>
      </DrawerHeader>

      <TaskFormFields
        ref="formFieldsRef"
        :initial-data="props.initialData"
        :members="props.members"
        :sprints="props.sprints"
        @submit="handleFieldsSubmit"
        @cancel="emit('close')"
      />
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import {
  type Task,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import TaskFormFields from "./TaskFormFields.vue";
import type { ProjectMember } from "@/shared/types/member";
import type { Sprint } from "@/shared/types/sprint";

const props = defineProps<{
  open: boolean;
  initialData?: Partial<Task>;
  members?: ProjectMember[];
  sprints?: Sprint[];
}>();

const emit = defineEmits<{
  submit: [data: CreateTaskPayload | UpdateTaskPayload, isEdit: boolean];
  close: [];
}>();

const { t } = useTaskboltTranslation();

const isEditMode = computed(() => {
  return !!(props.initialData && props.initialData.id);
});

const formFieldsRef = ref<InstanceType<typeof TaskFormFields> | null>(null);

// Reset form when opening for a new task is handled by TaskFormFields internally
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && !isEditMode.value) {
      formFieldsRef.value?.reset();
    }
  },
);

function handleFieldsSubmit(
  data: CreateTaskPayload | UpdateTaskPayload,
  isEdit: boolean,
) {
  emit("submit", data, isEdit);
}

function handleDrawerUpdate(isOpen: boolean) {
  if (!isOpen) {
    emit("close");
  }
}
</script>
