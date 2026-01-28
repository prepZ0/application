"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Spinner, Alert, AlertDescription, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";

export default function AdminDrivesPage() {
  const { data: drives, loading, error, execute: fetchDrives } = useApi<any[]>(api.drives.list);
  const { execute: deleteDrive } = useApi(api.drives.delete);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchDrives();
  }, []);

  const filteredDrives = drives?.filter((drive: any) =>
    drive.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drive.company?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    await deleteDrive(id);
    setDeleteModal(null);
    fetchDrives();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "secondary"> = {
      DRAFT: "secondary",
      REGISTRATION_OPEN: "success",
      IN_PROGRESS: "warning",
      COMPLETED: "default",
    };
    return <Badge variant={variants[status]}>{status.replace(/_/g, " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search drives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/admin/drives/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Drive
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
            ) : filteredDrives.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No drives found</p>
                <Link href="/admin/drives/new">
                  <Button className="mt-4">Create your first drive</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrives.map((drive: any) => (
                    <TableRow key={drive.id}>
                      <TableCell className="font-medium">{drive.title}</TableCell>
                      <TableCell>{drive.company || "-"}</TableCell>
                      <TableCell>{getStatusBadge(drive.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {drive.registrationCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/drives/${drive.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/drives/${drive.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteModal(drive.id)}
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
            <ModalTitle>Delete Drive</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete this drive? This action cannot be undone.
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
    </div>
  );
}
