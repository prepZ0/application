export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED"
  | "TERMINATED"
  | "GRADED";

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  startedAt: Date;
  submittedAt?: Date;
  endTime: Date;
  status: AttemptStatus;
  totalScore?: number;
  percentage?: number;
  passed?: boolean;
  tabSwitchCount: number;
  warnings?: Warning[];
}

export interface Warning {
  type: "TAB_SWITCH" | "FULLSCREEN_EXIT" | "COPY_PASTE" | "PROCTOR_ALERT";
  timestamp: Date;
  details?: string;
}

export interface Submission {
  id: string;
  testAttemptId: string;
  questionId: string;
  selectedOption?: string;
  code?: string;
  language?: string;
  executionResults?: ExecutionResult;
  isCorrect?: boolean;
  score?: number;
  gradedAt?: Date;
  submittedAt: Date;
  updatedAt: Date;
}

export interface ExecutionResult {
  results: TestCaseResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export interface TestCaseResult {
  passed: boolean;
  points: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
  executionTime?: number;
}

export interface SubmitMcqInput {
  questionId: string;
  selectedOption: string;
}

export interface SubmitCodeInput {
  questionId: string;
  code: string;
  language: string;
}

export interface RunCodeInput {
  code: string;
  language: string;
  stdin?: string;
}

export interface RunCodeOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
}

export interface TestResult {
  attemptId: string;
  testId: string;
  testTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  submittedAt: Date;
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  questionTitle: string;
  type: "MCQ" | "CODING";
  score: number;
  maxScore: number;
  isCorrect: boolean;
}
