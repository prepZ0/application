"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, org } from "@/lib/auth-client";
import type { ExtendedSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

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

    // Fetch user's role from the API (includes membership info)
    const resolveAndRoute = async () => {
      try {
        // Ensure an org is set as active
        const orgsRes = await org.list();
        const orgs = orgsRes?.data;

        if (!orgs || orgs.length === 0) {
          router.replace("/pending");
          return;
        }

        await org.setActive({ organizationId: orgs[0].id });

        // Get the active member to determine role
        const memberRes = await org.getActiveMember();
        const role = (memberRes as any)?.data?.role;

        switch (role) {
          case "owner":
          case "admin":
            router.replace("/admin");
            break;
          case "recruiter":
            router.replace("/recruiter");
            break;
          case "super_admin":
            router.replace("/super-admin");
            break;
          case "member":
          default:
            router.replace("/student");
            break;
        }
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
