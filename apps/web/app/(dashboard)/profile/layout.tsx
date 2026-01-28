"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/auth-provider";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();

  // Determine role based on session
  const collegeRole = session?.user?.collegeRole;
  let role: "student" | "admin" | "recruiter" | "super-admin" = "student";

  if (collegeRole === "owner" || collegeRole === "admin") {
    role = "admin";
  } else if (collegeRole === "recruiter") {
    role = "recruiter";
  } else if (collegeRole === "super_admin") {
    role = "super-admin";
  }

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="font-medium">Profile Settings</span>
        </header>
        <main className="flex-1 p-4 bg-muted/30">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
