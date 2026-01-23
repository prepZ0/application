export type QuestionType = "MCQ" | "CODING";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  content: string;
  marks: number;
  difficulty: Difficulty;
  tags: string[];
  collegeId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface McqQuestion extends Question {
  type: "MCQ";
  options: McqOption[];
}

export interface CodingQuestion extends Question {
  type: "CODING";
  starterCode: Record<string, string>;
  solution?: string;
  testCases: TestCase[];
  constraints?: string;
  allowedLanguages: string[];
  timeLimit: number;
  memoryLimit: number;
}

export interface McqOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
}

export interface CreateMcqQuestionInput {
  type: "MCQ";
  title: string;
  content: string;
  marks?: number;
  difficulty?: Difficulty;
  tags?: string[];
  options: Omit<McqOption, "id">[];
}

export interface CreateCodingQuestionInput {
  type: "CODING";
  title: string;
  content: string;
  marks?: number;
  difficulty?: Difficulty;
  tags?: string[];
  starterCode?: Record<string, string>;
  solution?: string;
  testCases: Omit<TestCase, "id">[];
  constraints?: string;
  allowedLanguages?: string[];
  timeLimit?: number;
  memoryLimit?: number;
}

export type CreateQuestionInput = CreateMcqQuestionInput | CreateCodingQuestionInput;
