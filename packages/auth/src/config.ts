/**
 * Better Auth shared configuration
 * This file contains shared auth configuration used by both API and Frontend
 */

export const AUTH_CONFIG = {
  // Session settings
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCacheMaxAge: 60 * 5, // 5 minutes
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  },

  // Rate limiting
  rateLimit: {
    window: 60 * 1000, // 1 minute
    max: 10, // 10 requests per window
  },

  // Cookie names
  cookies: {
    session: "placementhub_session",
    csrf: "placementhub_csrf",
  },
} as const;

// Organization (College) settings
export const ORGANIZATION_CONFIG = {
  // Roles available in the platform
  roles: ["owner", "admin", "member", "recruiter"] as const,

  // Default role for new members
  defaultRole: "member" as const,

  // Invitation expiry
  invitationExpiryDays: 7,
} as const;
