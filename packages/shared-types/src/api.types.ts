// Generic API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface PaginationInput {
  page?: number;
  pageSize?: number;
}

// Common filter types
export interface TestFilters {
  status?: string;
  search?: string;
}

export interface QuestionFilters {
  type?: string;
  difficulty?: string;
  tags?: string[];
  search?: string;
}

export interface DriveFilters {
  status?: string;
  search?: string;
}

// Execution types for Piston
export interface ExecuteRequest {
  language: string;
  code: string;
  stdin?: string;
}

export interface ExecuteResponse {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsed?: number;
}

export interface SupportedLanguage {
  id: string;
  name: string;
  version: string;
  monacoId: string;
  fileExtension: string;
}
