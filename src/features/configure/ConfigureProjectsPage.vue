<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" class="h-8 w-8 p-0" aria-label="Back" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <h2 class="text-xl font-semibold sm:text-2xl">{{ t('configure.projectManagement') }}</h2>
      </div>

      <Button size="sm" class="w-full sm:w-auto" @click="openCreateForm">
        {{ t('project.addProject') }}
      </Button>
    </div>

    <ProjectList />

    <ProjectForm
      :open="showCreateForm"
      @submit="handleProjectCreate"
      @close="closeCreateForm"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import { useShellServices, useTaskboltTranslation } from '@/shared/composables/useShellServices';
import { createProject } from '@/shared/services';
import { Button } from '@/shared/components/ui/button';
import type { CreateProjectPayload, UpdateProjectPayload } from '@/shared/types/project';
import ProjectList from './ProjectList.vue';
import ProjectForm from '@/features/projects/ProjectForm.vue';

const { t } = useTaskboltTranslation();
const { getApiClient, getToastService } = useShellServices();
const router = useRouter();

const showCreateForm = ref(false);

function openCreateForm() {
  showCreateForm.value = true;
}

function closeCreateForm() {
  showCreateForm.value = false;
}

function goBack() {
  router.push({ name: 'configure-home' });
}

async function handleProjectCreate(data: CreateProjectPayload | UpdateProjectPayload, isEdit: boolean) {
  if (isEdit) return;

  const apiClient = getApiClient();
  const toast = getToastService();

  if (!apiClient) {
    toast?.error(t('toast.apiClientUnavailable'));
    return;
  }

  try {
    const newProject = await createProject(apiClient, data as CreateProjectPayload);
    toast?.success(t('toast.projectCreated'));
    closeCreateForm();
    router.push({ name: 'project-detail', params: { projectId: newProject.id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : t('toast.genericError');
    toast?.error(t('toast.projectCreateFailed'));
    console.error('Project creation error:', message);
  }
}
</script>
