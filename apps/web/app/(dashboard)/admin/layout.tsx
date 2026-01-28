"use client";

import { Sidebar } from "@/components/dashboard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar role="admin" />
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}
