<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">{{ t('configure.title') }}</h2>
    <section>
      <h3 class="text-lg font-medium mb-4">{{ t('configure.projectManagement') }}</h3>
      <ProjectList />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import ProjectList from './ProjectList.vue';

const { t } = useTaskboltTranslation();
</script>
