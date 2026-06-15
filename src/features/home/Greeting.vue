<template>
    <div 
        class="widget p-6 rounded-2xl shadow-lg h-80 w-100 flex flex-col justify-center gap-3 transition-colors duration-500 relative overflow-hidden"
        :class="theme.bg"
    >
        <!-- Decorative abstract glow effects -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-full flex items-center relative z-10">
            <h2 class="text-4xl/11 font-bold tracking-tight" :class="theme.text">
                {{ greeting }},<br />
                <span class="opacity-90">{{ user?.name ?? "User" }}</span>
            </h2>
        </div>
        
        <p class="w-full text-base font-medium relative z-10" :class="theme.subtext">
            {{ t("widgets.greeting.description") }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { useTaskboltTranslation } from '@/shared/composables/useShellServices';
import { computed } from 'vue';
import { useUserStore } from '@/configs/store';

const { t } = useTaskboltTranslation();
const { user } = useUserStore();

const newDate = new Date();
const hours = newDate.getHours();

const greeting = computed(() => {
    if (hours < 12) {
        return t("widgets.greeting.morning");
    } else if (hours < 18) {
        return t("widgets.greeting.afternoon");
    } else {
        return t("widgets.greeting.evening");
    }
});

// Dynamic theme based on time of day using Tailwind gradients
const theme = computed(() => {
    if (hours < 12) {
        // Morning: Warm sunrise tones
        return {
            bg: 'bg-gradient-to-br from-amber-100 via-orange-100 to-rose-200',
            text: 'text-orange-950',
            subtext: 'text-orange-900/70'
        };
    } else if (hours < 18) {
        // Afternoon: Bright blue sky tones
        return {
            bg: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-200',
            text: 'text-sky-950',
            subtext: 'text-sky-900/70'
        };
    } else {
        // Evening: Deep twilight tones
        return {
            bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 shadow-indigo-900/20',
            text: 'text-white',
            subtext: 'text-indigo-200/80'
        };
    }
});
</script>