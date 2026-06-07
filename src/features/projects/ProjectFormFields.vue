<template>
  <div class="flex-1 overflow-auto">
    <div class="px-4 py-2">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div>
          <label class="text-sm font-medium block mb-1.5">
            {{ t('project.nameLabel') }}
            <span class="text-destructive">*</span>
          </label>
          <Input
            v-model="formData.name"
            :placeholder="t('project.namePlaceholder')"
            @blur="validateField('name')"
          />
          <p v-if="errors.name" class="text-sm text-destructive mt-1">
            {{ t(errors.name) }}
          </p>
        </div>

        <!-- Client Name Field -->
        <div>
          <label class="text-sm font-medium block mb-1.5">
            {{ t('project.clientNameLabel') }}
          </label>
          <Input
            v-model="formData.clientName"
            :placeholder="t('project.clientNamePlaceholder')"
          />
        </div>

        <!-- Status + Type Row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium block mb-1.5">
              {{ t('project.statusLabel') }}
            </label>
            <Select v-model="formData.status">
              <SelectTrigger>
                <SelectValue :placeholder="t('project.statusLabel')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="status in projectStatuses"
                  :key="status"
                  :value="status"
                >
                  {{ t(`projectStatus.${status}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label class="text-sm font-medium block mb-1.5">
              {{ t('project.typeLabel') }}
            </label>
            <Select v-model="formData.type">
              <SelectTrigger>
                <SelectValue :placeholder="t('project.typeLabel')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="type in projectTypes"
                  :key="type"
                  :value="type"
                >
                  {{ t(`projectType.${type}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Start Date + End Date Row -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-sm font-medium block mb-1.5">
              {{ t('project.startDateLabel') }}
            </label>
            <Input v-model="formData.startDate" type="date" />
          </div>
          <div>
            <label class="text-sm font-medium block mb-1.5">
              {{ t('project.endDateLabel') }}
            </label>
            <Input v-model="formData.endDate" type="date" />
          </div>
        </div>

        <!-- Description Field -->
        <div>
          <label class="text-sm font-medium block mb-1.5">
            {{ t('project.descriptionLabel') }}
          </label>
          <MarkdownEditor
            v-model="formData.description"
            :placeholder="t('project.descriptionPlaceholder')"
          />
        </div>
      </form>
    </div>
  </div>

  <div class="flex flex-row gap-2 p-4 border-t">
    <Button variant="outline" type="button" @click="emit('cancel')">
      {{ t('common.cancel') }}
    </Button>
    <Button type="button" @click="handleSubmit">
      {{ t('common.save') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { MarkdownEditor } from '@/shared/components/ui/markdown-editor';
import {
  ProjectStatus,
  ProjectType,
  type Project,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from '@/shared/types/project';
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import { isRequired } from '@/shared/lib/form-validation';

const props = defineProps<{
  initialData?: Project;
  mode: 'create' | 'edit';
}>();

const emit = defineEmits<{
  submit: [data: CreateProjectPayload | UpdateProjectPayload];
  cancel: [];
}>();

const { t } = useTaskboltTranslation();

const projectStatuses = Object.values(ProjectStatus);
const projectTypes = Object.values(ProjectType);

const formData = ref({
  name: '',
  clientName: '',
  description: '',
  status: ProjectStatus.ACTIVE as ProjectStatus,
  type: ProjectType.INTERNAL as ProjectType,
  startDate: '',
  endDate: '',
});

const errors = ref<Record<string, string | null>>({
  name: null,
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.value = {
        name: data.name || '',
        clientName: data.clientName || '',
        description: data.description || '',
        status: data.status,
        type: data.type,
        startDate: data.startDate ? data.startDate.slice(0, 10) : '',
        endDate: data.endDate ? data.endDate.slice(0, 10) : '',
      };
    }
  },
  { immediate: true, deep: true },
);

function validateField(field: string) {
  if (field === 'name') {
    errors.value.name = isRequired(formData.value.name);
  }
}

function validateForm(): boolean {
  validateField('name');
  return !errors.value.name;
}

function handleSubmit() {
  if (!validateForm()) return;

  if (props.mode === 'create') {
    const payload: CreateProjectPayload = {
      name: formData.value.name,
      clientName: formData.value.clientName || undefined,
      description: formData.value.description || undefined,
      status: formData.value.status,
      type: formData.value.type,
      startDate: formData.value.startDate || undefined,
      endDate: formData.value.endDate || undefined,
    };
    emit('submit', payload);
  } else {
    const payload: UpdateProjectPayload = {
      name: formData.value.name,
      clientName: formData.value.clientName || undefined,
      description: formData.value.description || undefined,
      status: formData.value.status,
      type: formData.value.type,
      startDate: formData.value.startDate || undefined,
      endDate: formData.value.endDate || undefined,
    };
    emit('submit', payload);
  }
}
</script>
