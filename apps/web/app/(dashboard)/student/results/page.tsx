"use client";

import { Card, CardHeader, CardTitle, CardContent, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

// Mock data for results - in production this would come from API
const mockResults = [
  { id: "1", testName: "JavaScript Fundamentals", score: 85, maxScore: 100, date: "2024-01-15", status: "passed" },
  { id: "2", testName: "React Assessment", score: 72, maxScore: 100, date: "2024-01-10", status: "passed" },
  { id: "3", testName: "Data Structures", score: 45, maxScore: 100, date: "2024-01-05", status: "failed" },
];

export default function StudentResultsPage() {
  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return <Badge variant="success">{score}/{maxScore}</Badge>;
    if (percentage >= 50) return <Badge variant="warning">{score}/{maxScore}</Badge>;
    return <Badge variant="destructive">{score}/{maxScore}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === "passed" ? (
      <Badge variant="success">Passed</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  const averageScore = mockResults.reduce((acc, r) => acc + r.score, 0) / mockResults.length;
  const passedTests = mockResults.filter(r => r.status === "passed").length;

  return (
    <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tests Passed</p>
                  <p className="text-2xl font-bold">{passedTests}/{mockResults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tests Failed</p>
                  <p className="text-2xl font-bold">{mockResults.length - passedTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.testName}</TableCell>
                    <TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getScoreBadge(result.score, result.maxScore)}</TableCell>
                    <TableCell>{getStatusBadge(result.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
