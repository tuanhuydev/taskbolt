<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">{{ t('configure.title') }}</h2>
    <section>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium">{{ t('configure.projectManagement') }}</h3>
        <Button size="sm" @click="openCreateForm">
          {{ t('project.addProject') }}
        </Button>
      </div>
      <ProjectList @project-created="fetchProjects" />
    </section>

    <ProjectForm
      :open="showCreateForm"
      @submit="handleProjectCreate"
      @close="closeCreateForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useShellServices, useTaskboltTranslation } from '@/shared/composables/useShellServices';
import { createProject } from '@/shared/services';
import { Button } from '@/shared/components/ui/button';
import type { CreateProjectPayload } from '@/shared/types/project';
import ProjectList from './ProjectList.vue';
import ProjectForm from '@/features/projects/ProjectForm.vue';

const { t } = useTaskboltTranslation();
const { getApiClient, getToastService } = useShellServices();
const router = useRouter();

const showCreateForm = ref(false);
const projectListKey = ref(0);

function openCreateForm() {
  showCreateForm.value = true;
}

function closeCreateForm() {
  showCreateForm.value = false;
}

function fetchProjects() {
  projectListKey.value++;
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
    fetchProjects();
    router.push({ name: 'project-detail', params: { projectId: newProject.id } });
  } catch (err) {
    const message = err instanceof Error ? err.message : t('toast.genericError');
    toast?.error(t('toast.projectCreateFailed'));
    console.error('Project creation error:', message);
  }
}
</script>
