export type UserRole = "super_admin" | "owner" | "admin" | "member" | "recruiter";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  phone?: string;
  rollNumber?: string;
  department?: string;
  graduationYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser extends User {
  // Org context is now on the session object, not the user.
  // These fields are kept for backward compatibility but deprecated.
  activeCollegeId?: string;
  activeCollegeName?: string;
  collegeRole?: UserRole;
}

export interface SessionOrgContext {
  activeOrganizationId?: string;
  activeOrganizationRole?: string;
  activeOrganizationName?: string;
  activeOrganizationSlug?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  rollNumber?: string;
  department?: string;
  graduationYear?: number;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  rollNumber?: string;
  department?: string;
  graduationYear?: number;
  image?: string;
}
