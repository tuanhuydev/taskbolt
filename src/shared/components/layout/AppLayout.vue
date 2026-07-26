<template>
  <!--
    The React shell mounts this remote below its own fixed MUI AppBar (48px,
    position: fixed — doesn't push flow but the shell's wrapper still reserves
    the space). h-screen/100vh here would claim the full viewport and push
    our own bottom 48px off-screen, unreachable by any scroll container.
    dvh (not vh) keeps this correct on mobile browsers with resizing chrome.
  -->
  <div
    class="flex h-[calc(100dvh-48px)] w-full bg-background overflow-hidden min-h-0"
  >
    <!-- Mobile backdrop -->
    <Transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <AppSidebar
      :current-route-name="currentRouteName"
      :open="sidebarOpen"
      @navigate="handleNavigate"
      @close="sidebarOpen = false"
    />

    <div class="flex-1 flex flex-col min-w-0 overflow-auto min-h-0">
      <!-- Mobile top bar -->
      <header
        class="flex-none h-12 px-4 flex items-center gap-3 border-b border-border bg-background md:hidden"
      >
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-accent transition-colors"
          @click="sidebarOpen = true"
        >
          <Menu class="w-5 h-5" />
        </button>
        <span class="font-semibold text-sm text-foreground">Taskbolt</span>
      </header>

      <main class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div
          class="flex flex-col flex-1 min-h-0 overflow-auto p-3 bg-accent/50"
        >
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Menu } from "lucide-vue-next";
import AppSidebar from "./AppSidebar.vue";
import { provideProjectContext } from "@/shared/composables/useProject";
import { useApiClient } from "@/shared/composables/useShellServices";
import { APP_AUTH_URL } from "@/shared/lib/constants";
import { useUserStore } from "@/configs/store";

const route = useRoute();
const router = useRouter();
const apiClient = useApiClient();
const userStore = useUserStore();

const sidebarOpen = ref(false);

const { selectedProjectId } = provideProjectContext();

const currentRouteName = computed(() => (route?.name as string) ?? undefined);

// Configure has its own :projectId semantics (see ConfigureHomePage) and
// isn't part of the shared project-scoped URL prefix, so it's excluded here.
const PROJECT_SCOPED_ROUTES = new Set(["home", "active-sprint", "backlogs", "reports"]);

function handleNavigate(routeName: string): void {
  sidebarOpen.value = false;
  const params = PROJECT_SCOPED_ROUTES.has(routeName)
    ? { projectId: selectedProjectId.value ?? undefined }
    : undefined;
  router.push({ name: routeName, params });
}

const getUserDetails = async () => {
  try {
    if (!apiClient) {
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
