import { prisma } from "./prisma";

interface OrgContext {
  activeOrganizationId: string;
  activeOrganizationRole: string;
  activeOrganizationName: string;
  activeOrganizationSlug: string;
}

/**
 * Resolves org membership for a user and persists the context on their session row.
 *
 * Called at login and org-switch time so that subsequent `getSession()` calls
 * return the org fields without any extra DB query.
 */
export async function resolveAndPersistOrgContext(
  sessionToken: string,
  userId: string,
  organizationId: string
): Promise<OrgContext | null> {
  const member = await prisma.member.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!member) return null;

  const context: OrgContext = {
    activeOrganizationId: member.organizationId,
    activeOrganizationRole: member.role,
    activeOrganizationName: member.organization.name,
    activeOrganizationSlug: member.organization.slug,
  };

  // Persist onto the session row so Better Auth returns it via getSession / cookie cache
  await prisma.session.updateMany({
    where: { token: sessionToken },
    data: context,
  });

  return context;
}

/**
 * Bulk-update all active sessions for a user+org when their role changes
 * or membership is revoked.
 */
export async function refreshOrgContextForUser(
  userId: string,
  organizationId: string
): Promise<void> {
  const member = await prisma.member.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
    include: {
      organization: {
        select: { name: true, slug: true },
      },
    },
  });

  if (member) {
    // Update all sessions that have this org active
    await prisma.session.updateMany({
      where: {
        userId,
        activeOrganizationId: organizationId,
        expiresAt: { gt: new Date() },
      },
      data: {
        activeOrganizationRole: member.role,
        activeOrganizationName: member.organization.name,
        activeOrganizationSlug: member.organization.slug,
      },
    });
  } else {
    // Membership removed — clear org context on affected sessions
    await prisma.session.updateMany({
      where: {
        userId,
        activeOrganizationId: organizationId,
        expiresAt: { gt: new Date() },
      },
      data: {
        activeOrganizationId: null,
        activeOrganizationRole: null,
        activeOrganizationName: null,
        activeOrganizationSlug: null,
      },
    });
  }
}
