"use client";

import { useEffect } from "react";
import { Building2, Users, FileText, Activity } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { data: colleges, loading, execute: fetchColleges } = useApi<any[]>(api.colleges.list);

  useEffect(() => {
    fetchColleges();
  }, []);

  return (
    <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Colleges"
            value={colleges?.length || 0}
            icon={<Building2 className="h-6 w-6" />}
          />
          <StatCard
            title="Total Users"
            value="0"
            icon={<Users className="h-6 w-6" />}
          />
          <StatCard
            title="Active Tests"
            value="0"
            icon={<FileText className="h-6 w-6" />}
          />
          <StatCard
            title="Platform Health"
            value="Good"
            icon={<Activity className="h-6 w-6" />}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/super-admin/colleges/new">
                <Button>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add College
                </Button>
              </Link>
              <Link href="/super-admin/users">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Colleges List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registered Colleges</CardTitle>
            <Link href="/super-admin/colleges">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !colleges || colleges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No colleges registered yet</p>
                <Link href="/super-admin/colleges/new">
                  <Button className="mt-4">Add First College</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {colleges.slice(0, 5).map((college: any) => (
                  <div key={college.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{college.name}</p>
                      <p className="text-sm text-muted-foreground">{college.location || "Location not set"}</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
