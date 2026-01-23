/**
 * Auth-related type definitions
 */

export type UserRole = "super_admin" | "owner" | "admin" | "member" | "recruiter";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isTestLocked?: boolean;
  activeTestAttemptId?: string;
}

export interface ExtendedSession {
  user: AuthUser & {
    activeCollegeId?: string;
    activeCollegeName?: string;
    collegeRole?: UserRole;
  };
  session: AuthSession;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Organization/College auth types
export interface OrganizationMembership {
  id: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: UserRole;
  joinedAt: Date;
}

export interface InvitationPayload {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
  inviterName: string;
}
