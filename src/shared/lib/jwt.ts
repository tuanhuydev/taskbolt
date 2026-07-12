export interface DecodedJwtPayload {
  sub?: string;
  tenantId?: string;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): DecodedJwtPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}
