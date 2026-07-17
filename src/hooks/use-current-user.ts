import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentUser() {
  const user = useQuery(api.users.getCurrentUserProfile);
  return {
    user,
    isLoading: user === undefined,
    isSignedIn: user !== null && user !== undefined,
  };
}
