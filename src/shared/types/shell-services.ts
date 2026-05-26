/**
 * Shell Service Registry Interface
 * Matches the actual ShellServiceRegistry class from the shell
 */
export interface ShellServiceRegistry {
  get<T = unknown>(name: string): T | null;
  has(name: string): boolean;
  list(): string[];
  getMetadata(name: string): unknown | null;
  getRegistryInfo(): ShellServiceMetadata;
}

export interface ShellServiceMetadata {
  version: string;
  availableServices: string[];
}

/**
 * Toast Service Interface
 */
export type ToastSeverity = "success" | "error" | "warning" | "info";

export interface ToastService {
  notify: (message: string, severity?: ToastSeverity) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

/**
 * ApiClient Service Interface
 */
export interface RequestOptions extends RequestInit {
  auth?: boolean; // default true — attach Authorization header
}

export interface ApiClient {
  logout(): void;
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  isTokenExpired(token: string): boolean;
  request(input: RequestInfo | URL, init?: RequestOptions): Promise<Response>;
}

/**
 * i18n Service — the actual i18next instance exposed by the shell
 */
export type { i18n as I18nService } from "i18next";

/**
 * Global window type extension
 */
declare global {
  interface Window {
    __SHELL_SERVICES__?: ShellServiceRegistry;
  }
}
