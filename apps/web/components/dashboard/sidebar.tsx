"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Settings,
  LogOut,
  GraduationCap,
  Briefcase,
  ClipboardList,
  Code2,
  Trophy,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: "student" | "admin" | "recruiter" | "super-admin";
}

const navItems: Record<string, NavItem[]> = {
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

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role] || [];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-bold">PlacementHub</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
