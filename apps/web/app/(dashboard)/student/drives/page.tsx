"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button, Input, Select, Spinner, Alert, AlertDescription } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { Search, Calendar, MapPin, Building2 } from "lucide-react";

export default function StudentDrivesPage() {
  const { data: drives, loading, error, execute: fetchDrives } = useApi<any[]>(api.drives.list);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchDrives();
  }, []);

  const filteredDrives = drives?.filter((drive: any) => {
    const matchesSearch = drive.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "secondary"> = {
      DRAFT: "secondary",
      REGISTRATION_OPEN: "success",
      IN_PROGRESS: "warning",
      COMPLETED: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace(/_/g, " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Drives Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No drives found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrives.map((drive: any) => (
              <Card key={drive.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{drive.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3" />
                        {drive.company || "Company Name"}
                      </CardDescription>
                    </div>
                    {getStatusBadge(drive.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {drive.registrationDeadline ? new Date(drive.registrationDeadline).toLocaleDateString() : "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{drive.location || "On-campus"}</span>
                  </div>
                  {drive.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{drive.description}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled={drive.status !== "REGISTRATION_OPEN"}>
                    {drive.status === "REGISTRATION_OPEN" ? "Register Now" : "View Details"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
