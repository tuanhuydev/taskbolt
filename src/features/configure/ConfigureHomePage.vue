<template>
  <ConfigureSectionShell
    title-key="configure.homeTitle"
    description-key="configure.sectionOverview"
  >
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="section in configureSections"
        :key="section.routeName"
        type="button"
        class="group rounded-2xl border border-transparent bg-white p-5 text-left transition-colors"
        @click="openSection(section.routeName)"
      >
        <div class="flex h-full flex-col justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              {{ section.kicker }}
            </div>
            <div class="space-y-1">
              <h3 class="text-lg font-medium">{{ section.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ section.description }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm font-medium">
            <span class="max-w-[70%] truncate text-muted-foreground">{{ section.path }}</span>
            <span class="transition-transform group-hover:translate-x-1">{{ t('configure.openSection') }}</span>
          </div>
        </div>
      </button>
    </div>
  </ConfigureSectionShell>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import ConfigureSectionShell from './ConfigureSectionShell.vue';

const router = useRouter();
const { t } = useTaskboltTranslation();

const configureSections = [
  {
    routeName: 'project-list' as const,
    kicker: t('sidebar.projects'),
    title: t('configure.projectManagement'),
    description: t('configure.projectManagementDescription'),
    path: '/configure/projects',
  },
];

function openSection(routeName: 'project-list') {
  router.push({ name: routeName });
}
</script>
