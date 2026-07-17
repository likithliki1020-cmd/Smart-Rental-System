import { useCurrentUser } from "./use-current-user";

export type Role = "owner" | "tenant" | "manager" | "admin";

export function useRole() {
  const { user, isLoading } = useCurrentUser();
  const role = (user?.role as Role | undefined) ?? null;

  return {
    role,
    isLoading,
    isOwner: role === "owner",
    isTenant: role === "tenant",
    isManager: role === "manager",
    isAdmin: role === "admin",
    hasAnyRole: (roles: Role[]) => (role ? roles.includes(role) : false),
  };
}
