<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <Button variant="ghost" size="sm" class="gap-1.5" @click="goBack">
        <ArrowLeft class="w-4 h-4" />
        {{ t('project.backToConfigure') }}
      </Button>
    </div>

    <p v-if="loading" class="text-muted-foreground">{{ t('common.loading') }}</p>
    <p v-else-if="error" class="text-destructive">{{ error }}</p>

    <template v-else-if="project">
      <!-- Project Title + Edit -->
      <div class="flex items-start justify-between mb-6">
        <div>
          <h2 class="text-2xl font-semibold">{{ project.name }}</h2>
          <p v-if="project.clientName" class="text-muted-foreground mt-1">
            {{ project.clientName }}
          </p>
        </div>
        <Button variant="outline" size="sm" class="gap-1.5 shrink-0" @click="openEditForm">
          <Pencil class="w-4 h-4" />
          {{ t('common.edit') }}
        </Button>
      </div>

      <!-- Project Details Card -->
      <div class="rounded-lg border bg-card p-6 mb-6 space-y-4">
        <!-- Status + Type badges -->
        <div class="flex flex-wrap gap-2">
          <span
            :class="cn('text-xs px-2.5 py-1 rounded-full font-medium', statusClasses[project.status])"
          >
            {{ t(`projectStatus.${project.status}`) }}
          </span>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-secondary-foreground">
            {{ t(`projectType.${project.type}`) }}
          </span>
        </div>

        <!-- Description -->
        <div v-if="project.description">
          <p class="text-sm font-medium text-muted-foreground mb-1">
            {{ t('project.descriptionLabel') }}
          </p>
          <p class="text-sm">{{ project.description }}</p>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-2 gap-4">
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

      <!-- Sprint Management -->
      <SprintManagement :project-id="project.id" />

      <!-- Member Management -->
      <ProjectMemberManagement :project-id="project.id" class="mt-6" />

      <!-- Edit Project Form -->
      <ProjectForm
        :open="showEditForm"
        :project="project"
        @submit="handleProjectUpdate"
        @close="closeEditForm"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Pencil } from 'lucide-vue-next';
import {
  useShellServices,
  useTaskboltTranslation,
} from '@/shared/composables/useShellServices';
import { getProjectById, updateProject } from '@/shared/services';
import { cn } from '@/shared/lib/utils';
import { ProjectStatus, type Project, type CreateProjectPayload, type UpdateProjectPayload } from '@/shared/types/project';
import { Button } from '@/shared/components/ui/button';
import SprintManagement from './SprintManagement.vue';
import ProjectMemberManagement from './ProjectMemberManagement.vue';
import ProjectForm from './ProjectForm.vue';

const route = useRoute();
const router = useRouter();
const { getApiClient, getToastService } = useShellServices();
const { t } = useTaskboltTranslation();

const project = ref<Project | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const showEditForm = ref(false);

const statusClasses: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-700',
  [ProjectStatus.INACTIVE]: 'bg-gray-100 text-gray-600',
  [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-700',
  [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-700',
};

onMounted(async () => {
  const apiClient = getApiClient();
  const projectId = route.params.projectId as string;

  if (!apiClient) {
    error.value = t('toast.apiClientUnavailable');
    loading.value = false;
    return;
  }

  try {
    project.value = await getProjectById(apiClient, projectId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('toast.genericError');
  } finally {
    loading.value = false;
  }
});

function goBack() {
  router.push({ name: 'configure' });
}

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}
</script>
