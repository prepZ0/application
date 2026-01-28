/**
 * API client for making authenticated requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      };
    }

    return data;
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST request
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Specific API methods
  tests = {
    list: () => this.get<any[]>("/api/tests"),
    get: (id: string) => this.get<any>(`/api/tests/${id}`),
    create: (data: any) => this.post<any>("/api/tests", data),
    update: (id: string, data: any) => this.put<any>(`/api/tests/${id}`, data),
    delete: (id: string) => this.delete<any>(`/api/tests/${id}`),
    start: (id: string) => this.post<any>(`/api/tests/${id}/start`),
    submit: (id: string) => this.post<any>(`/api/tests/${id}/submit`),
    publish: (id: string) => this.post<any>(`/api/tests/${id}/publish`),
  };

  questions = {
    list: () => this.get<any[]>("/api/questions"),
    get: (id: string) => this.get<any>(`/api/questions/${id}`),
    create: (data: any) => this.post<any>("/api/questions", data),
    update: (id: string, data: any) => this.put<any>(`/api/questions/${id}`, data),
    delete: (id: string) => this.delete<any>(`/api/questions/${id}`),
  };

  drives = {
    list: () => this.get<any[]>("/api/drives"),
    get: (id: string) => this.get<any>(`/api/drives/${id}`),
    create: (data: any) => this.post<any>("/api/drives", data),
    update: (id: string, data: any) => this.put<any>(`/api/drives/${id}`, data),
    delete: (id: string) => this.delete<any>(`/api/drives/${id}`),
    register: (id: string, data: any) => this.post<any>(`/api/drives/${id}/register`, data),
    candidates: (id: string) => this.get<any[]>(`/api/drives/${id}/candidates`),
  };

  submissions = {
    submitMcq: (data: any) => this.post<any>("/api/submissions/mcq", data),
    submitCode: (data: any) => this.post<any>("/api/submissions/code", data),
    submitAndGrade: (data: any) => this.post<any>("/api/submissions/code/submit", data),
    getResults: (attemptId: string) => this.get<any>(`/api/submissions/results/${attemptId}`),
  };

  execution = {
    run: (data: any) => this.post<any>("/api/execute", data),
    validate: (data: any) => this.post<any>("/api/execute/validate", data),
    languages: () => this.get<any[]>("/api/execute/languages"),
  };

  colleges = {
    list: () => this.get<any[]>("/api/colleges"),
    get: (id: string) => this.get<any>(`/api/colleges/${id}`),
    create: (data: any) => this.post<any>("/api/colleges", data),
    update: (id: string, data: any) => this.put<any>(`/api/colleges/${id}`, data),
    members: (id: string) => this.get<any[]>(`/api/colleges/${id}/members`),
  };

  user = {
    me: () => this.get<any>("/api/me"),
    update: (data: any) => this.put<any>("/api/me", data),
  };
}

export const api = new ApiClient(API_URL);
