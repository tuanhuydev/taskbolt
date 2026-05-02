<template>
  <div class="flex h-screen w-full bg-background">
    <AppSidebar :current-path="currentPath" @navigate="handleNavigate" />
    <main class="flex-1 flex flex-col overflow-hidden">
      <div class="flex flex-col flex-1 overflow-auto p-3">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import { provideProjectContext } from "@/shared/composables/useProject";

const emit = defineEmits<{
  newIssue: [];
}>();

const route = useRoute();
const router = useRouter();

// Provide project context to child components
const { selectedProjectId } = provideProjectContext();

const currentPath = computed(() => route?.path ?? "/");

function handleNavigate(path: string): void {
  router.push(path);
}
</script>
