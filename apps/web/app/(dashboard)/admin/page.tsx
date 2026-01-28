"use client";

import { useEffect } from "react";
import { FileText, Code2, Briefcase, Users } from "lucide-react";
import { Header, StatCard } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: tests, execute: fetchTests } = useApi<any[]>(api.tests.list);
  const { data: questions, execute: fetchQuestions } = useApi<any[]>(api.questions.list);
  const { data: drives, execute: fetchDrives } = useApi<any[]>(api.drives.list);

  useEffect(() => {
    fetchTests();
    fetchQuestions();
    fetchDrives();
  }, []);

  const recentTests = tests?.slice(0, 5) || [];
  const recentDrives = drives?.slice(0, 5) || [];

  return (
    <div className="min-h-screen">
      <Header title="Admin Dashboard" />

      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tests"
            value={tests?.length || 0}
            icon={<FileText className="h-6 w-6" />}
          />
          <StatCard
            title="Questions Bank"
            value={questions?.length || 0}
            icon={<Code2 className="h-6 w-6" />}
          />
          <StatCard
            title="Active Drives"
            value={drives?.filter((d: any) => d.status === "REGISTRATION_OPEN" || d.status === "IN_PROGRESS").length || 0}
            icon={<Briefcase className="h-6 w-6" />}
          />
          <StatCard
            title="Students"
            value="0"
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin/tests/new">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Test
                </Button>
              </Link>
              <Link href="/admin/questions/new">
                <Button variant="outline">
                  <Code2 className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </Link>
              <Link href="/admin/drives/new">
                <Button variant="outline">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Drive
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Tests</CardTitle>
              <Link href="/admin/tests">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tests created yet</p>
              ) : (
                <div className="space-y-3">
                  {recentTests.map((test: any) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{test.title}</p>
                        <p className="text-sm text-muted-foreground">{test.duration} min</p>
                      </div>
                      <Badge variant={test.status === "PUBLISHED" ? "success" : "secondary"}>
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Drives */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Drives</CardTitle>
              <Link href="/admin/drives">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentDrives.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No drives created yet</p>
              ) : (
                <div className="space-y-3">
                  {recentDrives.map((drive: any) => (
                    <div key={drive.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{drive.title}</p>
                        <p className="text-sm text-muted-foreground">{drive.company || "Company"}</p>
                      </div>
                      <Badge>{drive.status?.replace(/_/g, " ")}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
