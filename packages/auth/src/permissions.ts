import { createAccessControl } from "better-auth/plugins/access";

/**
 * Define all permissions in the platform
 */
export const accessControl = createAccessControl({
  // Test management
  test: ["create", "read", "update", "delete", "publish"],

  // Question management
  question: ["create", "read", "update", "delete"],

  // Drive management
  drive: ["create", "read", "update", "delete", "manage_registrations"],

  // Results access
  results: ["read", "export"],

  // College settings
  settings: ["read", "update"],

  // User management within college
  members: ["invite", "remove", "update_role"],
});

/**
 * Role definitions with their permissions
 */
export const roles = {
  // Super admin - platform owner (has all permissions + can create colleges)
  superAdmin: accessControl.newRole({
    test: ["create", "read", "update", "delete", "publish"],
    question: ["create", "read", "update", "delete"],
    drive: ["create", "read", "update", "delete", "manage_registrations"],
    results: ["read", "export"],
    settings: ["read", "update"],
    members: ["invite", "remove", "update_role"],
  }),

  // College owner - full access within their college
  owner: accessControl.newRole({
    test: ["create", "read", "update", "delete", "publish"],
    question: ["create", "read", "update", "delete"],
    drive: ["create", "read", "update", "delete", "manage_registrations"],
    results: ["read", "export"],
    settings: ["read", "update"],
    members: ["invite", "remove", "update_role"],
  }),

  // College admin - can manage tests, questions, drives
  admin: accessControl.newRole({
    test: ["create", "read", "update", "delete", "publish"],
    question: ["create", "read", "update", "delete"],
    drive: ["create", "read", "update", "delete", "manage_registrations"],
    results: ["read", "export"],
    settings: ["read"],
    members: ["invite"],
  }),

  // Recruiter - view-only access to drive results
  recruiter: accessControl.newRole({
    drive: ["read"],
    results: ["read", "export"],
  }),

  // Student (member) - can only take tests and view own results
  member: accessControl.newRole({
    test: ["read"],
    drive: ["read"],
    results: ["read"],
  }),
};

/**
 * Role hierarchy for display and comparison
 */
export const roleHierarchy: Record<
  string,
  { label: string; level: number; description: string }
> = {
  super_admin: {
    label: "Super Admin",
    level: 100,
    description: "Platform-wide administrator",
  },
  owner: {
    label: "College Owner",
    level: 90,
    description: "Full college management access",
  },
  admin: {
    label: "College Admin",
    level: 80,
    description: "Manage tests, questions, and drives",
  },
  recruiter: {
    label: "Recruiter",
    level: 50,
    description: "View drive results and candidate data",
  },
  member: {
    label: "Student",
    level: 10,
    description: "Take tests and view own results",
  },
};

/**
 * Check if a role can perform an action
 */
export function canPerform(
  role: string,
  resource: keyof typeof accessControl.statements,
  action: string
): boolean {
  const roleConfig = roles[role as keyof typeof roles];
  if (!roleConfig) return false;

  // @ts-expect-error - accessing role permissions dynamically
  const permissions = roleConfig[resource];
  return permissions?.includes(action) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string) {
  const roleConfig = roles[role as keyof typeof roles];
  if (!roleConfig) return null;
  return roleConfig;
}

/**
 * Check if role1 is higher than role2 in hierarchy
 */
export function isHigherRole(role1: string, role2: string): boolean {
  const level1 = roleHierarchy[role1]?.level ?? 0;
  const level2 = roleHierarchy[role2]?.level ?? 0;
  return level1 > level2;
}
