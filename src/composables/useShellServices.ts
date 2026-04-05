import { inject, ref, watch, onUnmounted, type InjectionKey } from 'vue';
import type { I18nService, ShellServiceRegistry, ToastService, ApiClient } from '@/types/shell-services';
import { taskboltTranslations } from '@/i18n/translations';

/**
 * Injection keys for shell services
 */
export const SHELL_SERVICES_KEY: InjectionKey<ShellServiceRegistry> = Symbol('shellServices');

/**
 * Get the shell service registry from window
 */
export function getShellServiceRegistry(): ShellServiceRegistry | null {
  return window.__SHELL_SERVICES__ || null;
}

/**
 * Composable to access shell services
 * Use this in any Vue component to access shell services
 */
export function useShellServices() {
  // Try to get from injection first (for testing/mocking)
  const injectedServices = inject(SHELL_SERVICES_KEY, null);
  const registry = injectedServices || getShellServiceRegistry();

  if (!registry) {
    console.warn('Shell services are not available');
  }

  return {
    registry,
    
    /**
     * Get Toast Service
     */
    getToastService(): ToastService | null {
      if (!registry) return null;
      
      // Try common service names
      const possibleNames = ['ToastService', 'toastService', 'toast'];
      for (const name of possibleNames) {
        const service = registry.get<ToastService>(name);
        if (service) {
          console.log(`[useShellServices] Found ToastService as "${name}"`);
          return service;
        }
      }
      
      console.warn('[useShellServices] ToastService not found. Available:', registry.list?.());
      return null;
    },

    /**
     * Get API Client
     */
    getApiClient(): ApiClient | null {
      if (!registry) return null;
      
      // Try common service names
      const possibleNames = ['ApiClient', 'apiClient', 'api'];
      for (const name of possibleNames) {
        const service = registry.get<ApiClient>(name);
        if (service) {
          console.log(`[useShellServices] Found ApiClient as "${name}"`);
          return service;
        }
      }
      
      console.warn('[useShellServices] ApiClient not found. Available:', registry.list?.());
      return null;
    },

    /**
     * Generic method to get any service by name
     */
    getService<T = unknown>(name: string): T | null {
      return registry?.get<T>(name) || null;
    },
  };
}

/**
 * Composable that initialises the taskbolt i18next namespace.
 * Mirrors the React useI18n() pattern: gets the shell's i18next instance,
 * adds the 'taskbolt' resource bundle for every supported language,
 * and returns { i18nInstance, isReady }.
 */
export function useI18n() {
  const { getService } = useShellServices();
  const i18nInstance = getService<I18nService>('i18n');
  const isReady = ref(false);

  if (i18nInstance) {
    Object.entries(taskboltTranslations).forEach(([lang, translations]) => {
      if (!i18nInstance.hasResourceBundle(lang, 'taskbolt')) {
        i18nInstance.addResourceBundle(lang, 'taskbolt', translations, true, false);
      }
    });
    isReady.value = true;
  }

  return { i18nInstance, isReady };
}

/**
 * Composable for translating strings within the taskbolt namespace.
 * Mirrors the React useBudtrTranslation() pattern.
 * Reacts to language changes from the shell.
 *
 * Usage: const { t } = useTaskboltTranslation()
 *        t('sidebar.activeSprint')  →  'Active Sprint'
 */
export function useTaskboltTranslation() {
  const { i18nInstance, isReady } = useI18n();
  // Tick counter forces Vue to re-render when language changes
  const _tick = ref(0);

  let cleanup: (() => void) | null = null;

  if (i18nInstance) {
    const onLanguageChanged = () => { _tick.value++; };
    i18nInstance.on('languageChanged', onLanguageChanged);
    cleanup = () => i18nInstance.off('languageChanged', onLanguageChanged);
    onUnmounted(() => cleanup?.());
  }

  const t = (key: string): string => {
    // Access _tick.value so Vue tracks the dependency
    void _tick.value;

    if (!i18nInstance || !isReady.value) return key;
    return i18nInstance.t(`taskbolt:${key}`);
  };

  return { t, isReady, i18n: i18nInstance };
}

/**
 * Convenience composables for specific services
 */
export function useToast() {
  const { getToastService } = useShellServices();
  const toast = getToastService();

  if (!toast) {
    console.warn('ToastService is not available');
    // Return no-op functions as fallback
    return {
      notify: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }

  return toast;
}

export function useApiClient() {
  const { getApiClient } = useShellServices();
  const apiClient = getApiClient();

  if (!apiClient) {
    console.warn('ApiClient is not available');
  }

  return apiClient;
}
