"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

interface Question {
  id: string;
  type: "MCQ" | "CODING";
  answered: boolean;
  flagged?: boolean;
}

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({ questions, currentIndex, onNavigate }: QuestionNavigatorProps) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-sm font-medium mb-3">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, index) => (
          <Button
            key={q.id}
            variant="outline"
            size="sm"
            onClick={() => onNavigate(index)}
            className={cn(
              "w-10 h-10 p-0",
              currentIndex === index && "ring-2 ring-primary",
              q.answered && "bg-green-100 border-green-300 text-green-700",
              q.flagged && "bg-yellow-100 border-yellow-300"
            )}
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border" />
          <span>Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-primary border" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}
