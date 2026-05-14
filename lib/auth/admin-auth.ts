export const ADMIN_AUTH_COOKIE_NAME = "admin-auth";
export const ADMIN_AUTH_COOKIE_VALUE = "authenticated";
const DEV_FALLBACK_ADMIN_ID = "admin";
const DEV_FALLBACK_ADMIN_PASSWORD = "ubmk2026!";

export interface AdminAuthEnv {
  adminId: string;
  adminPassword: string;
}

export function getAdminAuthEnv(): AdminAuthEnv | null {
  const adminId = process.env.ADMIN_ID?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminId || !adminPassword) {
    if (process.env.NODE_ENV !== "production") {
      return {
        adminId: DEV_FALLBACK_ADMIN_ID,
        adminPassword: DEV_FALLBACK_ADMIN_PASSWORD,
      };
    }
    return null;
  }

  return { adminId, adminPassword };
}

export function verifyAdminCredentials(
  inputId: string,
  inputPassword: string,
): boolean {
  const authEnv = getAdminAuthEnv();
  if (!authEnv) {
    return false;
  }

  return (
    inputId.trim() === authEnv.adminId &&
    inputPassword.trim() === authEnv.adminPassword
  );
}

export function isAdminSessionValue(value?: string): boolean {
  return value === ADMIN_AUTH_COOKIE_VALUE;
}
