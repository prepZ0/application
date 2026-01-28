"use client";

import Link from "next/link";
import { GraduationCap, Mail, User, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";

export default function PendingPage() {
  const { session } = useAuth();
  const userName = session?.user?.name || "there";

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome, {userName}!</CardTitle>
          <CardDescription>
            Your account is set up, but you're not part of any organization yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4" />
              Waiting for Invitation
            </h3>
            <p className="text-sm text-muted-foreground">
              You need to be invited by a college administrator to access the
              placement portal. Contact your placement cell if you haven't
              received an invitation yet.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              Complete Your Profile
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              While you wait, you can complete your profile to speed up the
              onboarding process once you're invited.
            </p>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Go to Profile
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
