"use client";

import { useEffect } from "react";
import { Briefcase, FileText, Trophy, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";

export default function StudentDashboard() {
  const { data: drives, loading: drivesLoading, execute: fetchDrives } = useApi<any[]>(api.drives.list);
  const { data: tests, loading: testsLoading, execute: fetchTests } = useApi<any[]>(api.tests.list);

  useEffect(() => {
    fetchDrives();
    fetchTests();
  }, []);

  const upcomingDrives = drives?.filter((d: any) => d.status === "REGISTRATION_OPEN").slice(0, 3) || [];
  const pendingTests = tests?.filter((t: any) => t.status === "PUBLISHED").slice(0, 3) || [];

  return (
    <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Registered Drives"
            value={drives?.length || 0}
            icon={<Briefcase className="h-6 w-6" />}
          />
          <StatCard
            title="Tests Completed"
            value={tests?.filter((t: any) => t.completed).length || 0}
            icon={<FileText className="h-6 w-6" />}
          />
          <StatCard
            title="Best Score"
            value="85%"
            icon={<Trophy className="h-6 w-6" />}
          />
          <StatCard
            title="Pending Tests"
            value={pendingTests.length}
            icon={<Clock className="h-6 w-6" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Drives */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Drives</CardTitle>
            </CardHeader>
            <CardContent>
              {drivesLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : upcomingDrives.length === 0 ? (
                <p className="text-muted-foreground">No upcoming drives</p>
              ) : (
                <div className="space-y-4">
                  {upcomingDrives.map((drive: any) => (
                    <div key={drive.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{drive.title}</p>
                        <p className="text-sm text-muted-foreground">{drive.company}</p>
                      </div>
                      <Badge>{drive.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tests</CardTitle>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : pendingTests.length === 0 ? (
                <p className="text-muted-foreground">No pending tests</p>
              ) : (
                <div className="space-y-4">
                  {pendingTests.map((test: any) => (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{test.title}</p>
                        <p className="text-sm text-muted-foreground">{test.duration} minutes</p>
                      </div>
                      <Button size="sm">Start Test</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
