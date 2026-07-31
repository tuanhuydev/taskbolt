<template>
  <ConfigureSectionShell title-key="configure.title">
    <template #eyebrow>
      <Folder class="h-3.5 w-3.5" />
      <span class="font-mono">{{ scopeLabel }}</span>
    </template>
    <template v-if="project && isAdmin" #actions>
      <Button
        variant="ghost"
        size="sm"
        class="h-9 w-9 p-0"
        :aria-label="t('common.edit')"
        :title="t('common.edit')"
        @click="openEditForm"
      >
        <Pencil class="h-4 w-4" />
      </Button>
    </template>

    <p v-if="loading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</p>
    <p v-else-if="error" class="text-sm text-destructive">{{ error }}</p>

    <div
      v-else-if="!selectedProjectId"
      class="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-muted-foreground"
    >
      {{ t('configure.selectProjectPrompt') }}
    </div>

    <template v-else-if="project">
      <div class="space-y-4 rounded-2xl border bg-white p-6">
        <div class="flex flex-wrap items-center gap-2">
          <span
            :class="cn('text-xs px-2.5 py-1 rounded-full font-medium', getStatusClass(project.status))"
          >
            {{ getStatusLabel(project.status) }}
          </span>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-secondary-foreground">
            {{ getTypeLabel(project.type) }}
          </span>
          <span v-if="project.clientName" class="text-sm text-muted-foreground">
            {{ project.clientName }}
          </span>
        </div>

        <div v-if="project.description">
          <p class="text-sm font-medium text-muted-foreground mb-1">
            {{ t('project.descriptionLabel') }}
          </p>
          <p class="text-sm">{{ project.description }}</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="project.startDate">
            <p class="text-sm font-medium text-muted-foreground mb-1">
              {{ t('project.startDateLabel') }}
            </p>
            <p class="text-sm">{{ formatDate(project.startDate) }}</p>
          </div>
          <div v-if="project.endDate">
            <p class="text-sm font-medium text-muted-foreground mb-1">
              {{ t('project.endDateLabel') }}
            </p>
            <p class="text-sm">{{ formatDate(project.endDate) }}</p>
          </div>
        </div>
      </div>

      <SprintManagement :project-id="project.id" :is-admin="isAdmin" />

      <ProjectMemberManagement :project-id="project.id" />

      <ProjectForm
        :open="showEditForm"
        :project="project"
        @submit="handleProjectUpdate"
        @close="closeEditForm"
      />
    </template>

    <!-- Coming soon -->
    <div class="space-y-3">
      <span class="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">
        {{ t('configure.comingSoon') }}
      </span>
      <div class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="card in comingSoonCards"
          :key="card.path"
          class="soon-card flex cursor-default flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition-shadow"
        >
          <div class="flex items-center justify-between gap-2.5">
            <Badge variant="neutral">{{ t('configure.plannedBadge') }}</Badge>
            <span class="flex h-8 w-8 items-center justify-center rounded-[9px] bg-slate-50 text-slate-700">
              <component :is="card.icon" class="h-4 w-4" />
            </span>
          </div>
          <div class="space-y-1">
            <p class="text-[15.5px] font-bold tracking-tight">{{ t(card.titleKey) }}</p>
            <p class="text-[13px] leading-relaxed text-muted-foreground">{{ t(card.descriptionKey) }}</p>
          </div>
          <div class="border-t pt-3">
            <span class="font-mono text-xs text-muted-foreground/80">{{ card.path }}</span>
          </div>
        </div>
      </div>
    </div>
  </ConfigureSectionShell>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Folder, Pencil, Columns3, Workflow, Bell } from 'lucide-vue-next';
import { useShellServices, useTaskboltTranslation } from '@/shared/composables/useShellServices';
import { useProjectContext } from '@/shared/composables/useProject';
import { useProjectRole } from '@/shared/composables/useProjectRole';
import { getProjectById, updateProject } from '@/shared/services';
import {
  formatDate,
  getProjectStatusClass,
  getProjectStatusTranslationKey,
  getProjectTypeTranslationKey,
} from '@/shared/lib/helpers';
import { cn } from '@/shared/lib/utils';
import { type Project, type CreateProjectPayload, type UpdateProjectPayload } from '@/shared/types/project';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import ConfigureSectionShell from './ConfigureSectionShell.vue';
import SprintManagement from '@/features/projects/SprintManagement.vue';
import ProjectMemberManagement from '@/features/projects/ProjectMemberManagement.vue';
import ProjectForm from '@/features/projects/ProjectForm.vue';

const { t } = useTaskboltTranslation();
const { getApiClient, getToastService } = useShellServices();
const { selectedProjectId, setSelectedProjectId } = useProjectContext();
const route = useRoute();
const router = useRouter();

const project = ref<Project | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showEditForm = ref(false);

const projectIdRef = computed(() => project.value?.id ?? null);
const { isAdmin } = useProjectRole(projectIdRef);

const scopeLabel = computed(() => project.value?.name ?? t('sidebar.personalWorkspace'));

function getStatusClass(value: string): string {
  return getProjectStatusClass(value);
}

function getStatusLabel(value: string): string {
  const translationKey = getProjectStatusTranslationKey(value);
  return translationKey ? t(translationKey) : value;
}

function getTypeLabel(value: string): string {
  const translationKey = getProjectTypeTranslationKey(value);
  return translationKey ? t(translationKey) : value;
}

async function loadProject(projectId: string | null) {
  if (!projectId) {
    project.value = null;
    loading.value = false;
    error.value = null;
    return;
  }

  const apiClient = getApiClient();
  if (!apiClient) {
    error.value = t('toast.apiClientUnavailable');
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    project.value = await getProjectById(apiClient, projectId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('toast.genericError');
  } finally {
    loading.value = false;
  }
}

// The URL's :projectId param and the sidebar's shared selectedProjectId
// context are kept in sync (both directions) so /configure/:projectId is a
// deep-linkable, copy/paste-able URL for a specific project's configure
// view, while switching projects from the sidebar still works everywhere
// else that reads selectedProjectId (Backlogs, Active Sprint, ...).
const routeProjectId = () => (route.params.projectId as string | undefined) || null;

onMounted(() => {
  const fromRoute = routeProjectId();
  if (fromRoute && fromRoute !== selectedProjectId.value) {
    setSelectedProjectId(fromRoute);
  }
  loadProject(selectedProjectId.value);
});

watch(selectedProjectId, (projectId) => {
  loadProject(projectId);
  if (routeProjectId() !== projectId) {
    router.replace({ name: 'configure-home', params: { projectId: projectId ?? undefined } });
  }
});

watch(
  () => route.params.projectId,
  () => {
    const fromRoute = routeProjectId();
    if (fromRoute !== selectedProjectId.value) {
      setSelectedProjectId(fromRoute);
    }
  },
);

function openEditForm() {
  showEditForm.value = true;
}

function closeEditForm() {
  showEditForm.value = false;
}

async function handleProjectUpdate(data: CreateProjectPayload | UpdateProjectPayload, isEdit: boolean) {
  if (!isEdit) return;

  const apiClient = getApiClient();
  const toast = getToastService();

  if (!apiClient || !project.value) {
    toast?.error(t('toast.apiClientUnavailable'));
    return;
  }

  try {
    project.value = await updateProject(apiClient, project.value.id, data as UpdateProjectPayload);
    toast?.success(t('toast.projectUpdated'));
    closeEditForm();
  } catch (err) {
    const message = err instanceof Error ? err.message : t('toast.genericError');
    toast?.error(t('toast.projectUpdateFailed'));
    console.error('Project update error:', message);
  }
}

const comingSoonCards = [
  {
    titleKey: 'configure.boardsTitle',
    descriptionKey: 'configure.boardsDescription',
    path: '/configure/boards',
    icon: Columns3,
  },
  {
    titleKey: 'configure.workflowTitle',
    descriptionKey: 'configure.workflowDescription',
    path: '/configure/workflow',
    icon: Workflow,
  },
  {
    titleKey: 'configure.notificationsTitle',
    descriptionKey: 'configure.notificationsDescription',
    path: '/configure/notifications',
    icon: Bell,
  },
];
</script>
