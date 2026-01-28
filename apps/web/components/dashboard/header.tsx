"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/providers/auth-provider";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{session?.user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
