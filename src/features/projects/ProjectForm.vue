<template>
  <Drawer
    direction="right"
    :fixed="true"
    :dismissible="false"
    :open="props.open"
    @update:open="handleDrawerUpdate"
  >
    <DrawerContent class="w-full max-w-[95vw] sm:max-w-[720px]">
      <DrawerHeader>
        <DrawerTitle>{{ isEditMode ? t('project.editTitle') : t('project.createTitle') }}</DrawerTitle>
      </DrawerHeader>
      <ProjectFormFields
        :initial-data="props.project"
        :mode="isEditMode ? 'edit' : 'create'"
        @submit="handleSubmit"
        @cancel="emit('close')"
      />
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '@/shared/types/project';
import ProjectFormFields from './ProjectFormFields.vue';

const props = defineProps<{
  open: boolean;
  project?: Project;
}>();

const emit = defineEmits<{
  submit: [data: CreateProjectPayload | UpdateProjectPayload, isEdit: boolean];
  close: [];
}>();

const { t } = useTaskboltTranslation();

const isEditMode = computed(() => !!props.project);

function handleSubmit(data: CreateProjectPayload | UpdateProjectPayload) {
  emit('submit', data, isEditMode.value);
}

function handleDrawerUpdate(isOpen: boolean) {
  if (!isOpen) {
    emit('close');
  }
}
</script>
