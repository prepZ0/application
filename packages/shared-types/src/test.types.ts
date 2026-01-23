export type TestStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Test {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  duration: number;
  passingScore: number;
  totalMarks: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  enableProctoring: boolean;
  fullScreenRequired: boolean;
  tabSwitchLimit: number;
  status: TestStatus;
  publishedAt?: Date;
  collegeId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestInput {
  title: string;
  description?: string;
  instructions?: string;
  duration: number;
  passingScore?: number;
  totalMarks?: number;
  shuffleQuestions?: boolean;
  showResults?: boolean;
  enableProctoring?: boolean;
  fullScreenRequired?: boolean;
  tabSwitchLimit?: number;
}

export interface UpdateTestInput extends Partial<CreateTestInput> {
  status?: TestStatus;
}

export interface TestWithQuestions extends Test {
  questions: TestQuestionWithDetails[];
}

export interface TestQuestionWithDetails {
  id: string;
  order: number;
  overrideMarks?: number;
  question: {
    id: string;
    type: "MCQ" | "CODING";
    title: string;
    content: string;
    marks: number;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    options?: McqOption[];
    starterCode?: Record<string, string>;
    constraints?: string;
    allowedLanguages: string[];
    timeLimit: number;
    memoryLimit: number;
  };
}

export interface McqOption {
  id: string;
  text: string;
  isCorrect?: boolean; // Only visible to admins
}
