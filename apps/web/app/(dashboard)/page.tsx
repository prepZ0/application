"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const user = session?.user;
    const activeCollegeId = user?.activeCollegeId;
    const collegeRole = user?.collegeRole;

    // If user has no organization membership, redirect to pending page
    if (!activeCollegeId) {
      router.replace("/pending");
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
  }, [session, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
