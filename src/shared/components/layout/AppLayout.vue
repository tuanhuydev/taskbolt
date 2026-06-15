<template>
  <div class="flex h-screen w-full bg-background">
    <AppSidebar :current-path="currentPath" @navigate="handleNavigate" />
    <main class="flex-1 flex flex-col overflow-hidden">
      <div class="flex flex-col flex-1 overflow-auto p-3 bg-accent/50">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import { provideProjectContext } from "@/shared/composables/useProject";
import { useApiClient } from "@/shared/composables/useShellServices";
import { APP_AUTH_URL } from "@/shared/lib/constants";
import { useUserStore } from "@/configs/store";

const emit = defineEmits<{
  newIssue: [];
}>();

const route = useRoute();
const router = useRouter();
const apiClient = useApiClient();
const userStore = useUserStore();

// Provide project context to child components
const { selectedProjectId } = provideProjectContext();

const currentPath = computed(() => route?.path ?? "/");

const handleNavigate = (path: string): void => {
  router.push(path);
}

const getUserDetails = async () => {
  try {
    if(!apiClient) {
      console.error("API client is not available");
      return;
    }
    const response = await apiClient.request(`${APP_AUTH_URL}/users/detail`, {
      method: "GET",
    });
    if (!response.ok) {
     throw new Error(`Failed to fetch user details: ${response.statusText}`);
    }
    const data = await response.json();
    userStore.setUser(data);
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
};

onMounted(() => {
  getUserDetails();
});

</script>
