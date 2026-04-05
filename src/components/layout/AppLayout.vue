<template>
	<div class="flex h-screen w-full bg-background">
		<AppSidebar :current-path="currentPath" @navigate="handleNavigate" />

		<!-- Main Content -->
		<main class="flex-1 flex flex-col overflow-hidden">
			<!-- Top Bar -->
			<header
				class="h-14 bg-background flex items-center justify-between pl-6 pr-2"
			>
				<div class="flex items-center gap-4">
					<Input
						type="text"
						:placeholder="t('header.searchPlaceholder')"
						class="w-64"
					/>
				</div>

				<div class="flex items-center gap-3">
					<Button @click="emit('newIssue')">
						{{ t("header.newIssue") }}
					</Button>
				</div>
			</header>

			<!-- Page Content -->
			<div class="flex-1 overflow-auto p-6">
				<router-view />
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppSidebar from "./AppSidebar.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskboltTranslation } from "@/composables/useShellServices";

const emit = defineEmits<{
	newIssue: [];
}>();

const { t } = useTaskboltTranslation();
const route = useRoute();
const router = useRouter();
console.log(route);

const currentPath = computed(() => route?.name as string);

function handleNavigate(routeName: string): void {
	router.push({ name: routeName });
}
</script>
