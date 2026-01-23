/**
 * Piston API types
 */

export interface PistonExecuteRequest {
  language: string;
  version: string;
  files: PistonFile[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

export interface PistonFile {
  name: string;
  content: string;
}

export interface PistonExecuteResponse {
  language: string;
  version: string;
  run: PistonRunResult;
  compile?: PistonRunResult;
}

export interface PistonRunResult {
  stdout: string;
  stderr: string;
  code: number;
  signal: string | null;
  output: string;
}

export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

// Client-facing types (simplified)
export interface ExecuteRequest {
  language: string;
  version?: string;
  code: string;
  stdin?: string;
  args?: string[];
  compileTimeout?: number;
  runTimeout?: number;
  compileMemoryLimit?: number;
  runMemoryLimit?: number;
}

export interface ExecuteResponse {
  language: string;
  version: string;
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime?: number;
  compile?: {
    stdout: string;
    stderr: string;
    exitCode: number;
  };
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  points: number;
  isHidden?: boolean;
}

export interface TestCaseResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  points: number;
  error?: string;
  executionTime?: number;
}

export interface TestCaseExecutionResult {
  results: TestCaseResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  allPassed: boolean;
}
