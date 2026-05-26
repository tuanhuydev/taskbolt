<template>
  <div class="flex-1 overflow-auto">
    <div class="px-4 py-2">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Title Field -->
        <div>
          <label class="text-sm font-medium block mb-1.5">
            {{ t("taskForm.titleLabel") }}
            <span class="text-destructive">*</span>
          </label>
          <Input
            v-model="formData.title"
            :placeholder="t('taskForm.titlePlaceholder')"
            @blur="validateField('title')"
          />
          <p v-if="errors.title" class="text-sm text-destructive mt-1">
            {{ t(errors.title) }}
          </p>
        </div>

        <!-- Type + Status Row -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Type Field -->
          <div>
            <label class="text-sm font-medium block mb-1.5">
              {{ t("taskForm.typeLabel") }}
              <span class="text-destructive">*</span>
            </label>
            <Select v-model="formData.type">
              <SelectTrigger>
                <SelectValue :placeholder="t('taskForm.typeLabel')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in taskTypes" :key="type" :value="type">
                  {{ t(`taskType.${type}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.type" class="text-sm text-destructive mt-1">
              {{ t(errors.type) }}
            </p>
          </div>

          <!-- Status Field -->
          <div>
            <label class="text-sm font-medium block mb-1.5">
              {{ t("taskForm.statusLabel") }}
            </label>
            <Select v-model="formData.status">
              <SelectTrigger>
                <SelectValue :placeholder="t('taskForm.statusLabel')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="status in taskStatuses"
                  :key="status"
                  :value="status"
                >
                  {{ t(`taskStatus.${status}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Priority + Story Points Row -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Priority Field -->
          <div>
            <label class="text-sm font-medium block mb-1.5">
              {{ t("taskForm.priorityLabel") }}
            </label>
            <Select v-model="formData.priority">
              <SelectTrigger>
                <SelectValue :placeholder="t('taskForm.priorityLabel')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="priority in taskPriorities"
                  :key="priority"
                  :value="priority"
                >
                  {{ t(`taskPriority.${priority}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Story Points Field (hidden for EPIC) -->
          <div v-if="showStoryPoint">
            <label class="text-sm font-medium block mb-1.5">
              {{ t("taskForm.storyPointLabel") }}
            </label>
            <Input
              v-model.number="formData.storyPoint"
              type="number"
              :placeholder="t('taskForm.storyPointPlaceholder')"
              min="0"
              step="1"
            />
          </div>
        </div>

        <!-- Description Field -->
        <div>
          <label class="text-sm font-medium block mb-1.5">
            {{ t("taskForm.descriptionLabel") }}
          </label>
          <MarkdownEditor
            v-model="formData.description"
            :placeholder="t('taskForm.descriptionPlaceholder')"
          />
        </div>
      </form>
    </div>
  </div>

  <div class="flex flex-row gap-2 p-4 border-t">
    <Button variant="outline" type="button" @click="emit('cancel')">
      {{ t("taskForm.cancelButton") }}
    </Button>
    <Button type="button" @click="handleSubmit">
      {{ isEditMode ? t("taskForm.updateButton") : t("taskForm.submitButton") }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { MarkdownEditor } from "@/shared/components/ui/markdown-editor";
import {
  TaskType,
  TaskStatus,
  TaskPriority,
  type Task,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/shared/types/task";
import { useTaskboltTranslation } from "@/shared/composables/useShellServices";
import { isRequired } from "@/shared/lib/form-validation";

const props = defineProps<{
  initialData?: Partial<Task>;
}>();

const emit = defineEmits<{
  submit: [data: CreateTaskPayload | UpdateTaskPayload, isEdit: boolean];
  cancel: [];
}>();

const { t } = useTaskboltTranslation();

const taskTypes = Object.values(TaskType);
const taskStatuses = Object.values(TaskStatus);
const taskPriorities = Object.values(TaskPriority);

const formData = ref({
  title: "",
  description: "",
  type: TaskType.STORY,
  status: undefined as TaskStatus | undefined,
  priority: TaskPriority.MEDIUM,
  storyPoint: undefined as number | undefined,
});

const errors = ref<Record<string, string | null>>({
  title: null,
  type: null,
});

const isEditMode = computed(() => {
  return !!(props.initialData && props.initialData.id);
});

const showStoryPoint = computed(() => formData.value.type !== TaskType.EPIC);

watch(
  () => formData.value.type,
  (type) => {
    if (type === TaskType.EPIC) {
      formData.value.storyPoint = undefined;
    }
  },
);

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.value = {
        title: data.title || "",
        description: data.description || "",
        type: data.type || TaskType.STORY,
        status: data.status,
        priority: data.priority || TaskPriority.MEDIUM,
        storyPoint:
          data.storyPoint !== undefined && data.storyPoint !== null
            ? Number(data.storyPoint)
            : undefined,
      };
    }
  },
  { immediate: true, deep: true },
);

function validateField(field: string) {
  if (field === "title") {
    errors.value.title = isRequired(formData.value.title);
  }
  if (field === "type") {
    errors.value.type = isRequired(formData.value.type);
  }
}

function validateForm(): boolean {
  validateField("title");
  validateField("type");
  return !errors.value.title && !errors.value.type;
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  const submitData: CreateTaskPayload = {
    title: formData.value.title,
    description: formData.value.description || undefined,
    type: formData.value.type,
    status: formData.value.status || undefined,
    priority: formData.value.priority || undefined,
    storyPoint:
      formData.value.storyPoint !== undefined &&
      formData.value.storyPoint !== null
        ? Number(formData.value.storyPoint)
        : undefined,
  };

  if (isEditMode.value && props.initialData?.id) {
    const updateData: UpdateTaskPayload = {
      ...submitData,
      id: props.initialData.id,
    };
    emit("submit", updateData, true);
    return;
  }

  emit("submit", submitData, isEditMode.value);
}

function reset() {
  formData.value = {
    title: "",
    description: "",
    type: TaskType.STORY,
    status: undefined,
    priority: TaskPriority.MEDIUM,
    storyPoint: undefined,
  };
  errors.value = { title: null, type: null };
}

defineExpose({ reset });
</script>
