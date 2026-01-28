"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import type { ExtendedSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardRouter() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  const session = sessionData as ExtendedSession | null;

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const user = session.user;
    const activeCollegeId = user.activeCollegeId;
    const collegeRole = user.collegeRole;

    if (!activeCollegeId) {
      router.replace("/pending");
      return;
    }

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
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
