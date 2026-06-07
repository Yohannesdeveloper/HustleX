import apiService from "../services/api";
import { FreelancerWithStatus } from "../types";

/** Load all freelancers (clients/admins only). */
export async function fetchFreelancerDirectory(): Promise<FreelancerWithStatus[]> {
  return apiService.getFreelancersWithStatus();
}

/** Resolve a user as FreelancerWithStatus from cache or GET /users/:id */
export async function resolveFreelancerById(
  userId: string,
  directory: FreelancerWithStatus[]
): Promise<FreelancerWithStatus | undefined> {
  const cached = directory.find((f) => f._id === userId);
  if (cached) return cached;

  try {
    const user = await apiService.getUserProfile(userId);
    if (!user?._id) return undefined;
    return {
      ...user,
      _id: user._id,
      status: "offline",
      lastActive: undefined,
    } as FreelancerWithStatus;
  } catch (error) {
    console.error("Failed to resolve freelancer profile:", userId, error);
    return undefined;
  }
}

export function getFreelancerDisplayName(
  freelancer: FreelancerWithStatus | undefined,
  fallback = "Unknown"
): string {
  if (!freelancer) return fallback;
  const profile = freelancer.profile || {};
  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  return name || freelancer.email || fallback;
}
