"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface MCQOption {
  id: string;
  text: string;
}

interface MCQQuestionProps {
  questionNumber: number;
  question: string;
  options: MCQOption[];
  selectedOption: string | null;
  onSelect: (optionId: string) => void;
  marks: number;
  showCorrectAnswer?: boolean;
  correctAnswer?: string;
}

export function MCQQuestion({
  questionNumber,
  question,
  options,
  selectedOption,
  onSelect,
  marks,
  showCorrectAnswer,
  correctAnswer,
}: MCQQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-medium">
          <span className="text-muted-foreground mr-2">Q{questionNumber}.</span>
          {question}
        </h3>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {marks} marks
        </span>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = showCorrectAnswer && correctAnswer === option.id;
          const isWrong = showCorrectAnswer && isSelected && !isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={showCorrectAnswer}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
                isSelected && !showCorrectAnswer && "border-primary bg-primary/5",
                isCorrect && "border-green-500 bg-green-50",
                isWrong && "border-red-500 bg-red-50",
                !isSelected && !showCorrectAnswer && "hover:bg-muted"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border text-sm font-medium",
                  isSelected && !showCorrectAnswer && "border-primary bg-primary text-primary-foreground",
                  isCorrect && "border-green-500 bg-green-500 text-white",
                  isWrong && "border-red-500 bg-red-500 text-white"
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option.text}</span>
              {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
