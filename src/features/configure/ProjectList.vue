<!-- @deprecated Only reached via the deprecated ConfigureProjectsPage.vue now. -->
<template>
  <div class="space-y-2">
    <p v-if="loading" class="text-muted-foreground text-sm">
      {{ t('common.loading') }}
    </p>
    <p v-else-if="error" class="text-destructive text-sm">{{ error }}</p>
    <p v-else-if="projects.length === 0" class="text-muted-foreground text-sm">
      {{ t('configure.noProjects') }}
    </p>
    <ul v-else class="space-y-2">
      <li
        v-for="project in projects"
        :key="project.id"
        class="flex flex-col items-start gap-3 rounded-md p-4 transition-colors bg-white sm:flex-row sm:items-center sm:justify-between"
        @click="navigateToProject(project.id)"
      >
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">{{ project.name }}</p>
          <p class="text-sm text-muted-foreground truncate">{{ project.clientName }}</p>
        </div>
        <div class="flex w-full items-center justify-between sm:ml-4 sm:w-auto sm:justify-end sm:gap-3 sm:shrink-0">
          <span
            :class="cn('text-xs px-2 py-1 rounded-full font-medium', getStatusClass(project.status))"
          >
            {{ getStatusLabel(project.status) }}
          </span>
          <ChevronRight class="w-4 h-4 text-muted-foreground" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import {
  useShellServices,
  useTaskboltTranslation,
} from '@/shared/composables/useShellServices';
import { getProjects } from '@/shared/services';
import {
  getProjectStatusClass,
  getProjectStatusTranslationKey,
} from '@/shared/lib/helpers';
import { cn } from '@/shared/lib/utils';
import type { Project } from '@/shared/types/project';

const router = useRouter();
const { getApiClient } = useShellServices();
const { t } = useTaskboltTranslation();

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

function getStatusClass(value: string): string {
  return getProjectStatusClass(value);
}

function getStatusLabel(value: string): string {
  const translationKey = getProjectStatusTranslationKey(value);
  return translationKey ? t(translationKey) : value;
}

onMounted(async () => {
  const apiClient = getApiClient();

  if (!apiClient) {
    error.value = t('toast.apiClientUnavailable');
    loading.value = false;
    return;
  }

  try {
    projects.value = await getProjects(apiClient);
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('toast.genericError');
  } finally {
    loading.value = false;
  }
});

function navigateToProject(projectId: string) {
  router.push({ name: 'project-detail', params: { projectId } });
}
</script>
