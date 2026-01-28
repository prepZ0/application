"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { OrgDisplay } from "./org-display";

type UserRole = "student" | "admin" | "recruiter" | "super-admin";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: UserRole;
}

export function AppSidebar({ role, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </div>
          <span className="font-bold group-data-[collapsible=icon]:hidden">
            PlacementHub
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <OrgDisplay />
        <SidebarSeparator />
        <NavMain role={role} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
