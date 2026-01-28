"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Settings,
  GraduationCap,
  Briefcase,
  ClipboardList,
  Code2,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

type UserRole = "student" | "admin" | "recruiter" | "super-admin";

const navItems: Record<UserRole, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "Drives", href: "/student/drives", icon: Briefcase },
    { label: "My Tests", href: "/student/tests", icon: FileText },
    { label: "Results", href: "/student/results", icon: Trophy },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Tests", href: "/admin/tests", icon: FileText },
    { label: "Questions", href: "/admin/questions", icon: Code2 },
    { label: "Drives", href: "/admin/drives", icon: Briefcase },
    { label: "Students", href: "/admin/students", icon: GraduationCap },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
  recruiter: [
    { label: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
    { label: "Drives", href: "/recruiter/drives", icon: Briefcase },
    { label: "Candidates", href: "/recruiter/candidates", icon: Users },
    { label: "Results", href: "/recruiter/results", icon: ClipboardList },
  ],
  "super-admin": [
    { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { label: "Colleges", href: "/super-admin/colleges", icon: Building2 },
    { label: "Users", href: "/super-admin/users", icon: Users },
    { label: "Settings", href: "/super-admin/settings", icon: Settings },
  ],
};

interface NavMainProps {
  role: UserRole;
}

export function NavMain({ role }: NavMainProps) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
