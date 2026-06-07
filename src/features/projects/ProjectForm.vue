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
        <DrawerTitle>{{ t('project.editTitle') }}</DrawerTitle>
      </DrawerHeader>
      <ProjectFormFields
        :initial-data="props.project"
        @submit="handleSubmit"
        @cancel="emit('close')"
      />
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import type { Project, UpdateProjectPayload } from '@/shared/types/project';
import ProjectFormFields from './ProjectFormFields.vue';

const props = defineProps<{
  open: boolean;
  project: Project;
}>();

const emit = defineEmits<{
  submit: [data: UpdateProjectPayload];
  close: [];
}>();

const { t } = useTaskboltTranslation();

function handleSubmit(data: UpdateProjectPayload) {
  emit('submit', data);
}

function handleDrawerUpdate(isOpen: boolean) {
  if (!isOpen) {
    emit('close');
  }
}
</script>
