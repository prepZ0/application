"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, org } from "@/lib/auth-client";
import type { ExtendedSession } from "@/lib/auth-client";
import { api } from "@/lib/api-client";
import { Spinner } from "@/components/ui/spinner";

function routeByRole(role: string | undefined | null): string {
  switch (role) {
    case "owner":
    case "admin":
      return "/admin";
    case "recruiter":
      return "/recruiter";
    case "super_admin":
      return "/super-admin";
    case "member":
    default:
      return "/student";
  }
}

export default function DashboardRouter() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const session = sessionData as ExtendedSession | null;
  const [routing, setRouting] = useState(false);

  useEffect(() => {
    if (isPending || routing) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    setRouting(true);

    // Session now carries org context directly (activeOrganizationRole, activeOrganizationId).
    const extSession = session as any;
    const role = extSession.session?.activeOrganizationRole;
    const orgId = extSession.session?.activeOrganizationId;

    if (role && orgId) {
      router.replace(routeByRole(role));
      return;
    }

    // Fallback: session doesn't have org info yet (first login or org not activated).
    // Resolve via org list + activate-org endpoint.
    const resolveAndRoute = async () => {
      try {
        const orgsRes = await org.list();
        const orgs = orgsRes?.data;

        if (!orgs || orgs.length === 0) {
          router.replace("/pending");
          return;
        }

        // 1. Set active org in Better Auth (updates client-side state + useActiveOrganization hook)
        await org.setActive({ organizationId: orgs[0].id });
        // 2. Persist role/name/slug on the session row for RBAC
        const activateRes = await api.user.activateOrg(orgs[0].id);
        const memberRole = activateRes?.data?.activeOrganizationRole;

        try { localStorage.setItem("placementhub_org", JSON.stringify({ name: orgs[0].name })); } catch {}

        router.replace(routeByRole(memberRole));
      } catch {
        router.replace("/pending");
      }
    };

    resolveAndRoute();
  }, [session, isPending, routing, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
