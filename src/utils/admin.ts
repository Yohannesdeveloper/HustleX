const DEFAULT_ADMIN_EMAIL = "hustlexet@gmail.com";

export function getAdminEmail(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_EMAIL;
  return (fromEnv || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
}

export function isAdminAccount(
  user: { email?: string; roles?: string[] } | null | undefined
): boolean {
  if (!user) return false;
  if (user.roles?.includes("admin")) return true;
  return user.email?.toLowerCase().trim() === getAdminEmail();
}
