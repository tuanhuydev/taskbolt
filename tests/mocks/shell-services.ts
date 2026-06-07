import { vi } from 'vitest';
import type { ApiClient, ToastService, ShellServiceRegistry } from '@/shared/types/shell-services';

export const mockApiClient: ApiClient = {
  logout: vi.fn(),
  getAccessToken: vi.fn(() => 'mock-token'),
  setAccessToken: vi.fn(),
  isTokenExpired: vi.fn(() => false),
  request: vi.fn(),
};

export const mockToastService: ToastService = {
  notify: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

export const mockI18n = {
  t: vi.fn((key: string) => key),
  addResourceBundle: vi.fn(),
  hasResourceBundle: vi.fn(() => false),
  on: vi.fn(),
  off: vi.fn(),
};

export const mockShellServices: ShellServiceRegistry = {
  get: vi.fn((name: string) => {
    if (name === 'ApiClient' || name === 'apiClient') return mockApiClient;
    if (name === 'ToastService' || name === 'toastService' || name === 'toast') return mockToastService;
    if (name === 'i18n') return mockI18n;
    return null;
  }),
  has: vi.fn(() => true),
  list: vi.fn(() => ['ApiClient', 'ToastService', 'i18n']),
  getMetadata: vi.fn(() => null),
  getRegistryInfo: vi.fn(() => ({
    version: '1.0.0',
    availableServices: ['ApiClient', 'ToastService', 'i18n'],
  })),
};

export function setupShellServices() {
  Object.defineProperty(window, '__SHELL_SERVICES__', {
    value: mockShellServices,
    writable: true,
    configurable: true,
  });
}

export function teardownShellServices() {
  // @ts-expect-error - cleanup
  delete window.__SHELL_SERVICES__;
}
