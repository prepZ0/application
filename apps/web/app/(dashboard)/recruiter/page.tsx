"use client";

import { useEffect } from "react";
import { Briefcase, Users, Trophy, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";

export default function RecruiterDashboard() {
  const { data: drives, loading, execute: fetchDrives } = useApi<any[]>(api.drives.list);

  useEffect(() => {
    fetchDrives();
  }, []);

  const activeDrives = drives?.filter((d: any) => d.status === "IN_PROGRESS") || [];
  const completedDrives = drives?.filter((d: any) => d.status === "COMPLETED") || [];

  return (
    <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Drives"
            value={drives?.length || 0}
            icon={<Briefcase className="h-6 w-6" />}
          />
          <StatCard
            title="Active Drives"
            value={activeDrives.length}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatCard
            title="Candidates Evaluated"
            value="0"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Shortlisted"
            value="0"
            icon={<Trophy className="h-6 w-6" />}
          />
        </div>

        {/* Drives List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Drives</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !drives || drives.length === 0 ? (
              <p className="text-muted-foreground">No drives assigned to you</p>
            ) : (
              <div className="space-y-4">
                {drives.map((drive: any) => (
                  <div key={drive.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{drive.title}</p>
                      <p className="text-sm text-muted-foreground">{drive.company || "Company"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{drive.registrationCount || 0} candidates</p>
                        <p className="text-xs text-muted-foreground">registered</p>
                      </div>
                      <Badge variant={drive.status === "COMPLETED" ? "default" : "success"}>
                        {drive.status?.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
