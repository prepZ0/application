"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Spinner, Alert, AlertDescription, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { Clock, FileText, Play } from "lucide-react";

export default function StudentTestsPage() {
  const { data: tests, loading, error, execute: fetchTests } = useApi<any[]>(api.tests.list);

  useEffect(() => {
    fetchTests();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "secondary"> = {
      DRAFT: "secondary",
      PUBLISHED: "success",
      CLOSED: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen">
      <Header title="My Tests" />

      <main className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : !tests || tests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tests available</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test: any) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {test.duration} min
                        </div>
                      </TableCell>
                      <TableCell>{test.totalQuestions || "-"}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell className="text-right">
                        {test.status === "PUBLISHED" ? (
                          <Link href={`/test/${test.id}`}>
                            <Button size="sm">
                              <Play className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                          </Link>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Not Available
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
