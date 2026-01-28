"use client";

import { Building2 } from "lucide-react";
import { organization } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Student",
  recruiter: "Recruiter",
  super_admin: "Super Admin",
};

const roleVariants: Record<string, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "default",
  member: "secondary",
  recruiter: "secondary",
  super_admin: "default",
};

export function OrgDisplay() {
  const { session } = useAuth();
  const { data: activeOrg } = organization.useActiveOrganization();

  const collegeName = activeOrg?.name || session?.user?.activeCollegeName || "No Organization";
  const collegeRole = session?.user?.collegeRole;
  const hasOrg = !!activeOrg || !!session?.user?.activeCollegeId;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{collegeName}</span>
            {hasOrg && collegeRole && (
              <Badge
                variant={roleVariants[collegeRole] || "outline"}
                className="mt-1 w-fit text-[10px] px-1.5 py-0"
              >
                {roleLabels[collegeRole] || collegeRole}
              </Badge>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
