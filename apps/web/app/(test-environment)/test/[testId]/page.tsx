"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Timer, MCQQuestion, CodeEditor, ProctoringMonitor, QuestionNavigator } from "@/components/test";
import { Button, Card, CardContent, Spinner, Alert, AlertDescription, Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui";
import { api } from "@/lib/api-client";
import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";

interface Question {
  id: string;
  type: "MCQ" | "CODING";
  title: string;
  description: string;
  marks: number;
  options?: { id: string; text: string }[];
  starterCode?: string;
}

interface TestData {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
  proctoring: {
    enabled: boolean;
    maxTabSwitches: number;
    requireFullscreen: boolean;
  };
}

export default function TestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState<{ type: string; count: number; timestamp: Date }[]>([]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.tests.get(testId);
        if (response.success && response.data) {
          // Start the test
          const startResponse = await api.tests.start(testId);
          if (!startResponse.success) {
            setError(startResponse.error?.message || "Failed to start test");
            return;
          }
          setTest(response.data);
        } else {
          setError(response.error?.message || "Failed to load test");
        }
      } catch (err) {
        setError("Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const currentQuestion = test?.questions[currentIndex];

  const handleAnswer = useCallback((questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNavigate = useCallback((index: number) => {
    if (index >= 0 && test && index < test.questions.length) {
      setCurrentIndex(index);
    }
  }, [test]);

  const handleFlag = useCallback(() => {
    if (!currentQuestion) return;
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  }, [currentQuestion]);

  const handleViolation = useCallback((type: "tab_switch" | "fullscreen_exit", count: number) => {
    setViolations((prev) => [...prev, { type, count, timestamp: new Date() }]);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.tests.submit(testId);
      if (response.success) {
        router.push(`/student/results?testId=${testId}`);
      } else {
        setError(response.error?.message || "Failed to submit test");
      }
    } catch (err) {
      setError("Failed to submit test");
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setShowSubmitModal(true);
    // Auto-submit after a short delay
    setTimeout(() => handleSubmit(), 3000);
  }, []);

  const handleTerminate = useCallback(() => {
    router.push("/student?terminated=true");
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || "Test not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const questionsWithStatus = test.questions.map((q) => ({
    id: q.id,
    type: q.type,
    answered: !!answers[q.id],
    flagged: flagged.has(q.id),
  }));

  const answeredCount = Object.keys(answers).length;

  return (
    <>
      {/* Proctoring Monitor */}
      {test.proctoring?.enabled && (
        <ProctoringMonitor
          maxTabSwitches={test.proctoring.maxTabSwitches || 3}
          requireFullscreen={test.proctoring.requireFullscreen}
          onViolation={handleViolation}
          onTerminate={handleTerminate}
        />
      )}

      <div className={`min-h-screen bg-muted/30 ${test.proctoring?.enabled ? "pt-12" : ""}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-semibold">{test.title}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {answeredCount}/{test.questions.length} answered
              </span>
              <Timer
                duration={test.duration * 60}
                onTimeUp={handleTimeUp}
              />
              <Button onClick={() => setShowSubmitModal(true)}>
                <Send className="h-4 w-4 mr-2" />
                Submit Test
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Area */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  {currentQuestion?.type === "MCQ" ? (
                    <MCQQuestion
                      questionNumber={currentIndex + 1}
                      question={currentQuestion.description}
                      options={currentQuestion.options || []}
                      selectedOption={answers[currentQuestion.id]}
                      onSelect={(optionId) => handleAnswer(currentQuestion.id, optionId)}
                      marks={currentQuestion.marks}
                    />
                  ) : currentQuestion?.type === "CODING" ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            Q{currentIndex + 1}. {currentQuestion.title}
                          </h3>
                          <p className="text-muted-foreground mt-2">{currentQuestion.description}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {currentQuestion.marks} marks
                        </span>
                      </div>
                      <div className="h-[500px]">
                        <CodeEditor
                          questionId={currentQuestion.id}
                          initialCode={answers[currentQuestion.id] || currentQuestion.starterCode}
                          onCodeChange={(code) => handleAnswer(currentQuestion.id, code)}
                          onSubmit={(code, language) => {
                            handleAnswer(currentQuestion.id, { code, language });
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleNavigate(currentIndex - 1)}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <Button
                      variant={flagged.has(currentQuestion?.id || "") ? "secondary" : "outline"}
                      onClick={handleFlag}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      {flagged.has(currentQuestion?.id || "") ? "Unflag" : "Flag for Review"}
                    </Button>

                    <Button
                      onClick={() => handleNavigate(currentIndex + 1)}
                      disabled={currentIndex === test.questions.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <QuestionNavigator
                questions={questionsWithStatus}
                currentIndex={currentIndex}
                onNavigate={handleNavigate}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal open={showSubmitModal} onClose={() => !submitting && setShowSubmitModal(false)}>
        <ModalHeader>
          <ModalTitle>Submit Test</ModalTitle>
          <ModalDescription>
            You have answered {answeredCount} out of {test.questions.length} questions.
            {answeredCount < test.questions.length && (
              <span className="block text-destructive mt-2">
                Warning: You have {test.questions.length - answeredCount} unanswered questions.
              </span>
            )}
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowSubmitModal(false)}
            disabled={submitting}
          >
            Continue Test
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Submit Test
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
