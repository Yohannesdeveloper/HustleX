import type { User } from "../store/authSlice";

const STORAGE_KEY = "hustlex_active_role";

export type ActiveRole = "freelancer" | "client" | "admin";

export function getActiveRole(user: User | null | undefined): ActiveRole | null {
  if (!user) return null;
  const role = user.currentRole || user.role;
  if (role === "client" || role === "freelancer" || role === "admin") return role;
  return null;
}

export function isClientMode(user: User | null | undefined): boolean {
  return getActiveRole(user) === "client";
}

export function isFreelancerMode(user: User | null | undefined): boolean {
  return getActiveRole(user) === "freelancer";
}

export function isAdminMode(user: User | null | undefined): boolean {
  return getActiveRole(user) === "admin";
}

export function persistActiveRole(role: ActiveRole): void {
  try {
    localStorage.setItem(STORAGE_KEY, role);
  } catch {
    // ignore storage errors
  }
}

export function readPersistedActiveRole(): ActiveRole | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "freelancer" || value === "client" || value === "admin") return value;
  } catch {
    // ignore storage errors
  }
  return null;
}

export function clearPersistedActiveRole(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function dashboardPathForRole(role: ActiveRole): string {
  if (role === "admin") return "/admin/dashboard";
  return role === "client" ? "/dashboard/hiring" : "/dashboard/freelancer";
}

export function isFreelancerProfileComplete(user: { profile?: any } | null | undefined): boolean {
  if (!user?.profile) return false;
  return user.profile.isProfileComplete || 
    (user.profile.skills && Array.isArray(user.profile.skills) && user.profile.skills.length > 0);
}