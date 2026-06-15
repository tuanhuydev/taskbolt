<template>
    <h2 class="text-2xl font-semibold mb-3">{{ t("sidebar.home") }}</h2>
    <div class="flex flex-wrap gap-3">
        <Greeting />
        <Pomodoro />
    </div>
</template>
<script lang="ts" setup>
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import Greeting from './Greeting.vue';
import Pomodoro from './Pomodoro.vue';

const { t } = useTaskboltTranslation();

</script>