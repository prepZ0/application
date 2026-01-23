import {
  ExecuteRequest,
  ExecuteResponse,
  PistonExecuteRequest,
  PistonExecuteResponse,
  PistonRuntime,
  TestCase,
  TestCaseExecutionResult,
  TestCaseResult,
} from "./types";
import { getFileName, getLanguageVersion } from "./languages";

/**
 * Piston Code Execution Client
 *
 * Provides a clean interface to the Piston API for executing code
 * in various programming languages with sandboxing.
 */
export class PistonClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultMemoryLimit: number;

  constructor(options?: {
    baseUrl?: string;
    defaultTimeout?: number;
    defaultMemoryLimit?: number;
  }) {
    this.baseUrl =
      options?.baseUrl ||
      process.env.PISTON_URL ||
      "https://emkc.org/api/v2/piston";
    this.defaultTimeout = options?.defaultTimeout || 5000; // 5 seconds
    this.defaultMemoryLimit = options?.defaultMemoryLimit || -1; // unlimited
  }

  /**
   * Get available runtimes from Piston
   */
  async getRuntimes(): Promise<PistonRuntime[]> {
    const response = await fetch(`${this.baseUrl}/runtimes`);

    if (!response.ok) {
      throw new Error(`Failed to fetch runtimes: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Execute code and return results
   */
  async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
    const startTime = Date.now();

    const payload: PistonExecuteRequest = {
      language: request.language,
      version: request.version || getLanguageVersion(request.language),
      files: [
        {
          name: getFileName(request.language),
          content: request.code,
        },
      ],
      stdin: request.stdin || "",
      args: request.args || [],
      compile_timeout: request.compileTimeout || 10000,
      run_timeout: request.runTimeout || this.defaultTimeout,
      compile_memory_limit: request.compileMemoryLimit || this.defaultMemoryLimit,
      run_memory_limit: request.runMemoryLimit || this.defaultMemoryLimit,
    };

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Piston execution failed: ${errorText}`);
    }

    const result: PistonExecuteResponse = await response.json();
    const executionTime = (Date.now() - startTime) / 1000;

    return {
      language: result.language,
      version: result.version,
      success: result.run.code === 0 && !result.run.stderr,
      stdout: result.run.stdout,
      stderr: result.run.stderr,
      exitCode: result.run.code,
      executionTime,
      compile: result.compile
        ? {
            stdout: result.compile.stdout,
            stderr: result.compile.stderr,
            exitCode: result.compile.code,
          }
        : undefined,
    };
  }

  /**
   * Execute code against multiple test cases
   */
  async executeWithTestCases(
    request: Omit<ExecuteRequest, "stdin">,
    testCases: TestCase[]
  ): Promise<TestCaseExecutionResult> {
    const results: TestCaseResult[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const testCase of testCases) {
      maxScore += testCase.points;

      try {
        const response = await this.execute({
          ...request,
          stdin: testCase.input,
          runTimeout: request.runTimeout || 3000, // 3 seconds per test case
        });

        const actualOutput = response.stdout.trim();
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;

        if (passed) {
          totalScore += testCase.points;
        }

        results.push({
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          points: passed ? testCase.points : 0,
          error: response.stderr || undefined,
          executionTime: response.executionTime,
        });
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "",
          points: 0,
          error: error instanceof Error ? error.message : "Execution failed",
        });
      }
    }

    return {
      results,
      totalScore,
      maxScore,
      percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      allPassed: totalScore === maxScore,
    };
  }

  /**
   * Execute code with timeout handling
   */
  async executeWithTimeout(
    request: ExecuteRequest,
    timeoutMs: number
  ): Promise<ExecuteResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await this.execute({
        ...request,
        runTimeout: Math.min(request.runTimeout || this.defaultTimeout, timeoutMs),
      });
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Singleton instance
let pistonClient: PistonClient | null = null;

/**
 * Get the singleton Piston client instance
 */
export function getPistonClient(): PistonClient {
  if (!pistonClient) {
    pistonClient = new PistonClient();
  }
  return pistonClient;
}

/**
 * Create a new Piston client with custom options
 */
export function createPistonClient(options?: {
  baseUrl?: string;
  defaultTimeout?: number;
  defaultMemoryLimit?: number;
}): PistonClient {
  return new PistonClient(options);
}
