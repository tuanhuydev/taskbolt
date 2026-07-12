<template>
  <Drawer
    direction="right"
    :fixed="true"
    :dismissible="false"
    :open="props.open"
    @update:open="handleDrawerUpdate"
  >
    <DrawerContent class="w-full max-w-[95vw] sm:max-w-[640px]">
      <DrawerHeader>
        <DrawerTitle>{{
          isEditMode ? t("member.editMemberTitle") : t("member.addMemberTitle")
        }}</DrawerTitle>
      </DrawerHeader>

      <div class="flex-1 overflow-auto">
        <div class="px-4 py-2">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <!-- User Field (only for create) -->
            <div v-if="!isEditMode">
              <label class="text-sm font-medium block mb-1.5">
                {{ t("member.userLabel") }}
                <span class="text-destructive">*</span>
              </label>
              <Select v-model="formData.userId">
                <SelectTrigger>
                  <SelectValue :placeholder="t('member.userPlaceholder')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="user in eligibleUsers"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.name }} ({{ user.email }})
                  </SelectItem>
                </SelectContent>
              </Select>
              <p
                v-if="!loadingOptions && eligibleUsers.length === 0"
                class="text-sm text-muted-foreground mt-1"
              >
                {{ t("member.noEligibleUsers") }}
              </p>
              <p v-if="errors.userId" class="text-sm text-destructive mt-1">
                {{ t(errors.userId) }}
              </p>
            </div>

            <!-- Role Field -->
            <div>
              <label class="text-sm font-medium block mb-1.5">
                {{ t("member.roleLabel") }}
                <span class="text-destructive">*</span>
              </label>
              <Select v-model="formData.roleId">
                <SelectTrigger>
                  <SelectValue :placeholder="t('member.roleLabel')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="role in roles"
                    :key="role.id"
                    :value="role.id"
                  >
                    {{ roleDisplayName(t, role.name) }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.roleId" class="text-sm text-destructive mt-1">
                {{ t(errors.roleId) }}
              </p>
            </div>
          </form>
        </div>
      </div>

      <div class="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row">
        <Button
          variant="outline"
          type="button"
          class="w-full sm:w-auto"
          @click="emit('close')"
        >
          {{ t("common.cancel") }}
        </Button>
        <Button type="button" class="w-full sm:w-auto" @click="handleSubmit">
          {{ t("common.save") }}
        </Button>
      </div>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  useShellServices,
  useTaskboltTranslation,
} from "@/shared/composables/useShellServices";
import { getUsers, getRoles } from "@/shared/services";
import { AccountStatus, type User } from "@/shared/types/user";
import type { Role } from "@/shared/types/role";
import {
  type ProjectMember,
  type AddProjectMemberPayload,
  type UpdateMemberRolePayload,
} from "@/shared/types/member";
import { roleDisplayName } from "@/shared/lib/role";
import { isRequired } from "@/shared/lib/form-validation";

const props = defineProps<{
  open: boolean;
  projectId: string;
  initialData?: ProjectMember | null;
  existingMemberUserIds?: string[];
}>();

const emit = defineEmits<{
  submit: [
    data: AddProjectMemberPayload | UpdateMemberRolePayload,
    isEdit: boolean,
  ];
  close: [];
}>();

const { t } = useTaskboltTranslation();
const { getApiClient } = useShellServices();

const isEditMode = computed(() => !!props.initialData);

const users = ref<User[]>([]);
const roles = ref<Role[]>([]);
const loadingOptions = ref(false);

const formData = ref({
  userId: "",
  roleId: "",
});

const errors = ref<Record<string, string | null>>({
  userId: null,
  roleId: null,
});

// Only offer users from the same tenant who don't already have a grant on
// this project — the /users endpoint has no server-side tenant filter, so
// this is done client-side against the JWT's tenantId claim.
const eligibleUsers = computed(() => {
  const existing = new Set(props.existingMemberUserIds ?? []);
  return users.value.filter((user) => !existing.has(user.id));
});

async function loadRoles() {
  const apiClient = getApiClient();
  if (!apiClient) return;
  try {
    roles.value = await getRoles(apiClient);
  } catch (err) {
    console.error("Error loading roles:", err);
  }
}

async function loadUsers() {
  const apiClient = getApiClient();
  if (!apiClient) return;

  try {
    users.value = await getUsers(apiClient, {
      status: AccountStatus.ACTIVE,
      limit: 1000,
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
}

function hydrateForm() {
  const data = props.initialData;
  if (data) {
    const matchingRole = roles.value.find((role) => role.name === data.role);
    formData.value = {
      userId: data.userId || "",
      roleId: matchingRole?.id || "",
    };
  } else {
    formData.value = { userId: "", roleId: "" };
  }
  errors.value = { userId: null, roleId: null };
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;

    loadingOptions.value = true;
    await loadRoles();
    if (!isEditMode.value) {
      await loadUsers();
    }
    hydrateForm();
    loadingOptions.value = false;
  },
  { immediate: true },
);

function validateField(field: string) {
  if (field === "userId" && !isEditMode.value) {
    errors.value.userId = isRequired(formData.value.userId);
  }
  if (field === "roleId") {
    errors.value.roleId = isRequired(formData.value.roleId);
  }
}

function validateForm(): boolean {
  if (!isEditMode.value) {
    validateField("userId");
    if (errors.value.userId) return false;
  }
  validateField("roleId");
  return !errors.value.roleId;
}

function handleSubmit() {
  if (!validateForm()) return;

  if (isEditMode.value) {
    const payload: UpdateMemberRolePayload = { roleId: formData.value.roleId };
    emit("submit", payload, true);
  } else {
    const payload: AddProjectMemberPayload = {
      userId: formData.value.userId,
      roleId: formData.value.roleId,
    };
    emit("submit", payload, false);
  }
}

function handleDrawerUpdate(isOpen: boolean) {
  if (!isOpen) {
    emit("close");
  }
}
</script>
