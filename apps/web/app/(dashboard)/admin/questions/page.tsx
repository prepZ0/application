"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, Button, Badge, Input, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Spinner, Alert, AlertDescription, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { Plus, Search, Edit, Trash2, Eye, Code2, ListChecks } from "lucide-react";

export default function AdminQuestionsPage() {
  const { data: questions, loading, error, execute: fetchQuestions } = useApi<any[]>(api.questions.list);
  const { execute: deleteQuestion } = useApi(api.questions.delete);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions?.filter((q: any) => {
    const matchesSearch = q.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || q.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const handleDelete = async (id: string) => {
    await deleteQuestion(id);
    setDeleteModal(null);
    fetchQuestions();
  };

  const getTypeBadge = (type: string) => {
    return type === "CODING" ? (
      <Badge variant="secondary">
        <Code2 className="h-3 w-3 mr-1" />
        Coding
      </Badge>
    ) : (
      <Badge>
        <ListChecks className="h-3 w-3 mr-1" />
        MCQ
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, "success" | "warning" | "destructive"> = {
      EASY: "success",
      MEDIUM: "warning",
      HARD: "destructive",
    };
    return <Badge variant={variants[difficulty]}>{difficulty}</Badge>;
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-40"
            >
              <option value="all">All Types</option>
              <option value="MCQ">MCQ</option>
              <option value="CODING">Coding</option>
            </Select>
          </div>
          <Link href="/admin/questions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
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
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No questions found</p>
                <Link href="/admin/questions/new">
                  <Button className="mt-4">Add your first question</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question: any) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium max-w-xs truncate">{question.title}</TableCell>
                      <TableCell>{getTypeBadge(question.type)}</TableCell>
                      <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                      <TableCell>{question.marks}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/questions/${question.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/questions/${question.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteModal(question.id)}
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
            <ModalTitle>Delete Question</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete this question? This action cannot be undone.
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
