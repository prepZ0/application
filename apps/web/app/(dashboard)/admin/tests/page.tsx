"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Spinner, Alert, AlertDescription, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { Plus, Search, Edit, Trash2, Eye, Play } from "lucide-react";

export default function AdminTestsPage() {
  const { data: tests, loading, error, execute: fetchTests } = useApi<any[]>(api.tests.list);
  const { execute: deleteTest } = useApi(api.tests.delete);
  const { execute: publishTest } = useApi(api.tests.publish);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const filteredTests = tests?.filter((test: any) =>
    test.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    await deleteTest(id);
    setDeleteModal(null);
    fetchTests();
  };

  const handlePublish = async (id: string) => {
    await publishTest(id);
    fetchTests();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "secondary"> = {
      DRAFT: "secondary",
      PUBLISHED: "success",
      CLOSED: "default",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen">
      <Header title="Tests Management" />

      <main className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/admin/tests/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tests found</p>
                <Link href="/admin/tests/new">
                  <Button className="mt-4">Create your first test</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.map((test: any) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.title}</TableCell>
                      <TableCell>{test.duration} min</TableCell>
                      <TableCell>{test.totalMarks}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/tests/${test.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/tests/${test.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {test.status === "DRAFT" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePublish(test.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteModal(test.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)}>
          <ModalHeader>
            <ModalTitle>Delete Test</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete this test? This action cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteModal && handleDelete(deleteModal)}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </main>
    </div>
  );
}
