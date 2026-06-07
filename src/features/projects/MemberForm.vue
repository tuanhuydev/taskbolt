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
        <DrawerTitle>{{ isEditMode ? t('member.editMemberTitle') : t('member.addMemberTitle') }}</DrawerTitle>
      </DrawerHeader>

      <div class="flex-1 overflow-auto">
        <div class="px-4 py-2">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- User ID Field (only for create) -->
            <div v-if="!isEditMode">
              <label class="text-sm font-medium block mb-1.5">
                {{ t('member.userIdLabel') }}
                <span class="text-destructive">*</span>
              </label>
              <Input
                v-model="formData.userId"
                :placeholder="t('member.userIdPlaceholder')"
                @blur="validateField('userId')"
              />
              <p v-if="errors.userId" class="text-sm text-destructive mt-1">
                {{ t(errors.userId) }}
              </p>
            </div>

            <!-- Role Field -->
            <div>
              <label class="text-sm font-medium block mb-1.5">
                {{ t('member.roleLabel') }}
                <span class="text-destructive">*</span>
              </label>
              <Select v-model="formData.role">
                <SelectTrigger>
                  <SelectValue :placeholder="t('member.roleLabel')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="role in memberRoles"
                    :key="role"
                    :value="role"
                  >
                    {{ t(`memberRole.${role}`) }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.role" class="text-sm text-destructive mt-1">
                {{ t(errors.role) }}
              </p>
            </div>
          </form>
        </div>
      </div>

      <div class="flex flex-row gap-2 p-4 border-t">
        <Button variant="outline" type="button" @click="emit('close')">
          {{ t('common.cancel') }}
        </Button>
        <Button type="button" @click="handleSubmit">
          {{ t('common.save') }}
        </Button>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
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
import {
  MemberRole,
  type ProjectMember,
  type AddProjectMemberPayload,
  type UpdateMemberRolePayload,
} from '@/shared/types/member';
import { isRequired } from '@/shared/lib/form-validation';

const props = defineProps<{
  open: boolean;
  projectId: string;
  initialData?: ProjectMember | null;
}>();

const emit = defineEmits<{
  submit: [data: AddProjectMemberPayload | UpdateMemberRolePayload, isEdit: boolean];
  close: [];
}>();

const { t } = useTaskboltTranslation();

const memberRoles = Object.values(MemberRole);
const isEditMode = computed(() => !!props.initialData);

const formData = ref({
  userId: '',
  role: MemberRole.MEMBER as MemberRole,
});

const errors = ref<Record<string, string | null>>({
  userId: null,
  role: null,
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      formData.value = {
        userId: data.userId || '',
        role: data.role,
      };
    } else {
      formData.value = {
        userId: '',
        role: MemberRole.MEMBER,
      };
    }
  },
  { immediate: true },
);

function validateField(field: string) {
  if (field === 'userId' && !isEditMode.value) {
    errors.value.userId = isRequired(formData.value.userId);
  }
  if (field === 'role') {
    errors.value.role = isRequired(formData.value.role);
  }
}

function validateForm(): boolean {
  if (!isEditMode.value) {
    validateField('userId');
    if (errors.value.userId) return false;
  }
  validateField('role');
  return !errors.value.role;
}

function handleSubmit() {
  if (!validateForm()) return;

  if (isEditMode.value) {
    const payload: UpdateMemberRolePayload = {
      role: formData.value.role,
    };
    emit('submit', payload, true);
  } else {
    const payload: AddProjectMemberPayload = {
      userId: formData.value.userId,
      role: formData.value.role,
    };
    emit('submit', payload, false);
  }
}

function handleDrawerUpdate(isOpen: boolean) {
  if (!isOpen) {
    emit('close');
  }
}
</script>
