import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

/**
 * Better Auth client for the frontend
 *
 * Provides hooks and utilities for authentication:
 * - useSession() - Get current session
 * - signIn() - Sign in with email/password
 * - signUp() - Register new user
 * - signOut() - Sign out
 * - organization - Organization/college management
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  plugins: [organizationClient()],
});

// Destructure for easier imports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  organization,
} = authClient;

// Organization methods accessed via better-auth's proxy.
// Direct calls use short paths (e.g., organization.list -> /organization/list).
// Hooks are exposed at top-level with "use" prefix (e.g., authClient.useActiveOrganization).
interface OrganizationClient {
  create: (data: { name: string; slug: string }) => Promise<any>;
  setActive: (data: { organizationId: string | null } | { organizationSlug: string | null }) => Promise<any>;
  getFullOrganization: () => Promise<any>;
  getActiveMember: () => Promise<any>;
  list: () => Promise<{ data: Array<{ id: string; name: string; slug: string }> }>;
}

export const org = organization as unknown as OrganizationClient;

// React hooks from the organization plugin (exposed at top-level with "use" prefix)
export const useActiveOrganization = (authClient as any).useActiveOrganization as () => {
  data: { id: string; name: string; slug: string; logo?: string } | null;
  isPending: boolean;
};

// Types
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

// Extended session type with college info
export interface ExtendedUser extends User {
  activeCollegeId?: string;
  activeCollegeName?: string;
  activeCollegeSlug?: string;
  collegeRole?: string;
}

export interface ExtendedSession extends Session {
  user: ExtendedUser;
}
