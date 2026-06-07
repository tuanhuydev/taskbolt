<template>
  <section>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-medium">{{ t('member.title') }}</h3>
      <Button size="sm" @click="openAddForm">
        {{ t('member.addMember') }}
      </Button>
    </div>

    <p v-if="loading" class="text-muted-foreground text-sm">
      {{ t('common.loading') }}
    </p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <p v-else-if="members.length === 0" class="text-muted-foreground text-sm">
      {{ t('member.noMembers') }}
    </p>
    <ul v-else class="space-y-2">
      <li
        v-for="member in members"
        :key="member.id"
        class="flex items-center justify-between p-4 rounded-lg border bg-card"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{{ member.userName }}</p>
          <p class="text-sm text-muted-foreground truncate">{{ member.userEmail }}</p>
        </div>
        <div class="flex items-center gap-2 ml-4 shrink-0">
          <span
            :class="cn('text-xs px-2 py-1 rounded-full font-medium', roleClasses[member.role])"
          >
            {{ t(`memberRole.${member.role}`) }}
          </span>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0"
            @click="openEditForm(member)"
          >
            <Pencil class="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-8 w-8 p-0 text-destructive hover:text-destructive"
            @click="confirmRemove(member)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </Button>
        </div>
      </li>
    </ul>

    <MemberForm
      :open="showMemberForm"
      :project-id="projectId"
      :initial-data="selectedMember"
      @submit="handleMemberSubmit"
      @close="closeMemberForm"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Pencil, Trash2 } from 'lucide-vue-next';
import {
  useShellServices,
  useTaskboltTranslation,
} from '@/shared/composables/useShellServices';
import {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from '@/shared/services';
import { cn } from '@/shared/lib/utils';
import {
  MemberRole,
  type ProjectMember,
  type AddProjectMemberPayload,
  type UpdateMemberRolePayload,
} from '@/shared/types/member';
import { Button } from '@/shared/components/ui/button';
import MemberForm from './MemberForm.vue';

const props = defineProps<{ projectId: string }>();

const { getApiClient, getToastService } = useShellServices();
const { t } = useTaskboltTranslation();

const members = ref<ProjectMember[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showMemberForm = ref(false);
const selectedMember = ref<ProjectMember | null>(null);

const roleClasses: Record<MemberRole, string> = {
  [MemberRole.OWNER]: 'bg-purple-100 text-purple-700',
  [MemberRole.ADMIN]: 'bg-blue-100 text-blue-700',
  [MemberRole.MEMBER]: 'bg-green-100 text-green-700',
  [MemberRole.VIEWER]: 'bg-gray-100 text-gray-600',
};

onMounted(fetchMembers);

async function fetchMembers() {
  const apiClient = getApiClient();
  if (!apiClient) {
    error.value = t('toast.apiClientUnavailable');
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    members.value = await getProjectMembers(apiClient, props.projectId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('toast.genericError');
  } finally {
    loading.value = false;
  }
}

function openAddForm() {
  selectedMember.value = null;
  showMemberForm.value = true;
}

function openEditForm(member: ProjectMember) {
  selectedMember.value = member;
  showMemberForm.value = true;
}

function closeMemberForm() {
  showMemberForm.value = false;
  selectedMember.value = null;
}

async function handleMemberSubmit(
  data: AddProjectMemberPayload | UpdateMemberRolePayload,
  isEdit: boolean,
) {
  const apiClient = getApiClient();
  const toast = getToastService();

  if (!apiClient) {
    toast?.error(t('toast.apiClientUnavailable'));
    return;
  }

  try {
    if (isEdit && selectedMember.value) {
      await updateMemberRole(
        apiClient,
        props.projectId,
        selectedMember.value.id,
        data as UpdateMemberRolePayload,
      );
      toast?.success(t('toast.memberUpdated'));
    } else {
      await addProjectMember(apiClient, props.projectId, data as AddProjectMemberPayload);
      toast?.success(t('toast.memberAdded'));
    }
    closeMemberForm();
    await fetchMembers();
  } catch (err) {
    const message = err instanceof Error ? err.message : t('toast.genericError');
    toast?.error(isEdit ? t('toast.memberUpdateFailed') : t('toast.memberAddFailed'));
    console.error('Member submit error:', message);
  }
}

async function confirmRemove(member: ProjectMember) {
  if (!window.confirm(`Remove "${member.userName}" from this project?`)) return;

  const apiClient = getApiClient();
  const toast = getToastService();

  if (!apiClient) {
    toast?.error(t('toast.apiClientUnavailable'));
    return;
  }

  try {
    await removeProjectMember(apiClient, props.projectId, member.id);
    toast?.success(t('toast.memberRemoved'));
    await fetchMembers();
  } catch (err) {
    const message = err instanceof Error ? err.message : t('toast.genericError');
    toast?.error(t('toast.memberRemoveFailed'));
    console.error('Member remove error:', message);
  }
}
</script>
