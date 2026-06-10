import { ProjectStatus, ProjectType } from '@/shared/types/project';

const projectStatusValues = new Set<string>(Object.values(ProjectStatus));
const projectTypeValues = new Set<string>(Object.values(ProjectType));

const projectStatusClasses: Record<ProjectStatus, string> = {
  [ProjectStatus.GOING]: 'bg-green-100 text-green-700',
  [ProjectStatus.PLAN]: 'bg-sky-100 text-sky-700',
  [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-700',
  [ProjectStatus.CLOSED]: 'bg-gray-100 text-gray-700',
};

const fallbackProjectStatusClass = 'bg-gray-100 text-gray-600';

function normalizeToken(value?: string | null): string | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return normalized || null;
}

export function normalizeProjectStatus(value?: string | null): ProjectStatus | null {
  const normalized = normalizeToken(value);
  if (!normalized || !projectStatusValues.has(normalized)) {
    return null;
  }

  return normalized as ProjectStatus;
}

export function normalizeProjectType(value?: string | null): ProjectType | null {
  const normalized = normalizeToken(value);
  if (!normalized || !projectTypeValues.has(normalized)) {
    return null;
  }

  return normalized as ProjectType;
}

export function getProjectStatusClass(value: string): string {
  const normalized = normalizeProjectStatus(value);
  return normalized ? projectStatusClasses[normalized] : fallbackProjectStatusClass;
}

export function getProjectStatusTranslationKey(
  value: string,
): `projectStatus.${ProjectStatus}` | null {
  const normalized = normalizeProjectStatus(value);
  return normalized ? `projectStatus.${normalized}` : null;
}

export function getProjectTypeTranslationKey(
  value: string,
): `projectType.${ProjectType}` | null {
  const normalized = normalizeProjectType(value);
  return normalized ? `projectType.${normalized}` : null;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}