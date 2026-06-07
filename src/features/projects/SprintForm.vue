<template>
  <Drawer
    direction="right"
    :fixed="true"
    :dismissible="false"
    :open="props.open"
    @update:open="handleDrawerUpdate"
  >
    <DrawerContent class="w-full max-w-[95vw] sm:max-w-[560px]">
      <DrawerHeader>
        <DrawerTitle>
          {{ isEditMode ? t('sprint.editTitle') : t('sprint.createTitle') }}
        </DrawerTitle>
      </DrawerHeader>

      <div class="flex-1 overflow-auto">
        <div class="px-4 py-2">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- Name Field -->
            <div>
              <label class="text-sm font-medium block mb-1.5">
                {{ t('sprint.nameLabel') }}
                <span class="text-destructive">*</span>
              </label>
              <Input
                v-model="formData.name"
                :placeholder="t('sprint.namePlaceholder')"
                @blur="validateField('name')"
              />
              <p v-if="errors.name" class="text-sm text-destructive mt-1">
                {{ t(errors.name) }}
              </p>
            </div>

            <!-- Status (edit mode only) -->
            <div v-if="isEditMode">
              <label class="text-sm font-medium block mb-1.5">
                {{ t('sprint.statusLabel') }}
              </label>
              <Select v-model="formData.status">
                <SelectTrigger>
                  <SelectValue :placeholder="t('sprint.statusLabel')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="status in sprintStatuses"
                    :key="status"
                    :value="status"
                  >
                    {{ t(`sprintStatus.${status}`) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Start + End Date -->
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="text-sm font-medium block mb-1.5">
                  {{ t('sprint.startDateLabel') }}
                </label>
                <Input v-model="formData.startDate" type="date" />
              </div>
              <div>
                <label class="text-sm font-medium block mb-1.5">
                  {{ t('sprint.endDateLabel') }}
                </label>
                <Input v-model="formData.endDate" type="date" />
              </div>
            </div>

            <!-- Goal Field -->
            <div>
              <label class="text-sm font-medium block mb-1.5">
                {{ t('sprint.goalLabel') }}
              </label>
              <Input
                v-model="formData.goal"
                :placeholder="t('sprint.goalPlaceholder')"
              />
            </div>
          </form>
        </div>
      </div>

      <div class="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row">
        <Button variant="outline" type="button" class="w-full sm:w-auto" @click="emit('close')">
          {{ t('common.cancel') }}
        </Button>
        <Button type="button" class="w-full sm:w-auto" @click="handleSubmit">
          {{ t('common.save') }}
        </Button>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import { isRequired } from '@/shared/lib/form-validation';
import {
  SprintStatus,
  type Sprint,
  type CreateSprintPayload,
  type UpdateSprintPayload,
} from '@/shared/types/sprint';

const props = defineProps<{
  open: boolean;
  projectId: string;
  initialData?: Sprint | null;
}>();

const emit = defineEmits<{
  submit: [data: CreateSprintPayload | UpdateSprintPayload, isEdit: boolean];
  close: [];
}>();

const { t } = useTaskboltTranslation();
const sprintStatuses = Object.values(SprintStatus);

const isEditMode = computed(() => !!props.initialData?.id);

const formData = ref({
  name: '',
  status: SprintStatus.PLANNING as SprintStatus,
  startDate: '',
  endDate: '',
  goal: '',
});

const errors = ref<Record<string, string | null>>({ name: null });

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.value = {
        name: data.name || '',
        status: data.status || SprintStatus.PLANNING,
        startDate: data.startDate ? data.startDate.slice(0, 10) : '',
        endDate: data.endDate ? data.endDate.slice(0, 10) : '',
        goal: data.goal || '',
      };
    } else {
      formData.value = {
        name: '',
        status: SprintStatus.PLANNING,
        startDate: '',
        endDate: '',
        goal: '',
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

  if (isEditMode.value && props.initialData?.id) {
    const updateData: UpdateSprintPayload = {
      id: props.initialData.id,
      name: formData.value.name,
      status: formData.value.status,
      startDate: formData.value.startDate || null,
      endDate: formData.value.endDate || null,
      goal: formData.value.goal || null,
    };
    emit('submit', updateData, true);
    return;
  }

  const createData: CreateSprintPayload = {
    name: formData.value.name,
    projectId: props.projectId,
    startDate: formData.value.startDate || null,
    endDate: formData.value.endDate || null,
    goal: formData.value.goal || null,
  };
  emit('submit', createData, false);
}

function handleDrawerUpdate(isOpen: boolean) {
  if (!isOpen) {
    emit('close');
  }
}
</script>
