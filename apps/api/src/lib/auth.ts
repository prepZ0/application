import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import { accessControl, roles, AUTH_CONFIG } from "@placementhub/auth";

/**
 * Better Auth server instance
 *
 * Configured with:
 * - Prisma adapter for Supabase PostgreSQL
 * - Organization plugin for multi-tenancy (colleges)
 * - Custom session with college context
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Base URL for the API
  baseURL: process.env.BETTER_AUTH_URL || process.env.API_URL,

  // Secret for signing tokens
  secret: process.env.BETTER_AUTH_SECRET,

  // Email + Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with email service
    sendResetPassword: async ({ user, url }) => {
      // TODO: Integrate with email service (Resend, SendGrid, etc.)
      console.log(`[Auth] Password reset requested for ${user.email}`);
      console.log(`[Auth] Reset URL: ${url}`);
    },
  },

  // Session configuration
  session: {
    expiresIn: AUTH_CONFIG.session.expiresIn,
    updateAge: AUTH_CONFIG.session.updateAge,
    cookieCache: {
      enabled: true,
      maxAge: AUTH_CONFIG.session.cookieCacheMaxAge,
    },
  },

  // User fields configuration
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      rollNumber: {
        type: "string",
        required: false,
      },
      department: {
        type: "string",
        required: false,
      },
      graduationYear: {
        type: "number",
        required: false,
      },
    },
  },

  // Plugins
  plugins: [
    // Organization plugin for multi-tenancy (Colleges)
    organization({
      // Access control configuration
      ac: accessControl,
      roles: {
        owner: roles.owner,
        admin: roles.admin,
        member: roles.member,
        recruiter: roles.recruiter,
      },

      // Only super admins can create organizations (colleges)
      // Regular users cannot create colleges
      allowUserToCreateOrganization: async (_user) => {
        // In the future, check if user is super admin
        // For now, disable for all users - colleges created via API by super admin
        return false;
      },

      // Handle invitation emails
      sendInvitationEmail: async ({ invitation, organization, inviter }) => {
        const inviteUrl = `${process.env.FRONTEND_URL}/invite/${invitation.id}`;
        // TODO: Integrate with email service
        console.log(`[Auth] Invitation sent to ${invitation.email}`);
        console.log(`[Auth] Organization: ${organization.name}`);
        console.log(`[Auth] Inviter: ${inviter.name}`);
        console.log(`[Auth] Accept URL: ${inviteUrl}`);
      },
    }),
  ],

  // Callbacks for custom logic
  callbacks: {
    // Add college context to session
    session: async ({ session, user }) => {
      try {
        // Fetch user's organization membership
        const membership = await prisma.member.findFirst({
          where: { userId: user.id },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        });

        return {
          ...session,
          user: {
            ...session.user,
            activeCollegeId: membership?.organizationId ?? null,
            activeCollegeName: membership?.organization.name ?? null,
            activeCollegeSlug: membership?.organization.slug ?? null,
            collegeRole: membership?.role ?? null,
          },
        };
      } catch (error) {
        console.error("[Auth] Error fetching membership:", error);
        return session;
      }
    },
  },

  // Advanced configuration
  advanced: {
    // Use secure cookies in production
    useSecureCookies: process.env.NODE_ENV === "production",

    // Cookie prefix
    cookiePrefix: "placementhub",
  },
});

// Export auth types
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session["user"];
