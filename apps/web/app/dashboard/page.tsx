"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, org } from "@/lib/auth-client";
import type { ExtendedSession } from "@/lib/auth-client";
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
      return "/student";
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

    // The session callback already enriches the session with collegeRole
    // and activeCollegeId. If available, route immediately — no extra API calls.
    const role = session.user.collegeRole;
    if (role && session.user.activeCollegeId) {
      router.replace(routeByRole(role));
      return;
    }

    // Fallback: session doesn't have org info yet (e.g. first login before
    // cookie cache is populated). Resolve via org API.
    const resolveAndRoute = async () => {
      try {
        const orgsRes = await org.list();
        const orgs = orgsRes?.data;

        if (!orgs || orgs.length === 0) {
          router.replace("/pending");
          return;
        }

        await org.setActive({ organizationId: orgs[0].id });

        const memberRes = await org.getActiveMember();
        const memberRole = (memberRes as any)?.data?.role;

        try { localStorage.setItem("placementhub_org", JSON.stringify({ name: orgs[0].name })); } catch {};

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
