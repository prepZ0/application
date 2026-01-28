"use client";

import { Sidebar } from "@/components/dashboard";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar role="recruiter" />
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}
