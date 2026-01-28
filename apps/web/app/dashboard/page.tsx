"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, organization } from "@/lib/auth-client";
import type { ExtendedSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardRouter() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const session = sessionData as ExtendedSession | null;
  const [settingOrg, setSettingOrg] = useState(false);

  useEffect(() => {
    if (isPending || settingOrg) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const user = session.user;
    const activeCollegeId = user.activeCollegeId;
    const collegeRole = user.collegeRole;

    // If user has no org info in session, try to fetch and set it
    if (!activeCollegeId) {
      setSettingOrg(true);
      // List user's orgs and set the first one as active
      organization.listOrganizations().then(async (res) => {
        const orgs = res?.data;
        if (orgs && orgs.length > 0) {
          await organization.setActive({ organizationId: orgs[0].id });
          // Reload to get fresh session with active org
          window.location.href = "/dashboard";
        } else {
          router.replace("/pending");
        }
      }).catch(() => {
        router.replace("/pending");
      });
      return;
    }

    // Route based on role
    switch (collegeRole) {
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
  }, [session, isPending, settingOrg, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
