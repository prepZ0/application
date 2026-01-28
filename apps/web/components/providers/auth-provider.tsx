"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession, type ExtendedSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui";

interface AuthContextValue {
  session: ExtendedSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
    }
  }, [isPending]);

  return (
    <AuthContext.Provider
      value={{
        session: session as ExtendedSession | null,
        isLoading,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const { session, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = session?.user?.collegeRole;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
