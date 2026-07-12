// Backend-seeded system roles (see mfex-api's RoleService SYSTEM_ROLES) — the
// only role names with translations. Tenant-custom role names can't be
// pre-translated and are shown as-is.
const SYSTEM_ROLE_NAMES = new Set(["ADMIN", "MEMBER", "VIEWER"]);

export function roleDisplayName(
  t: (key: string) => string,
  roleName: string,
): string {
  if (!SYSTEM_ROLE_NAMES.has(roleName)) return roleName;
  return t(`memberRole.${roleName}`);
}
