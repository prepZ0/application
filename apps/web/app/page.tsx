"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      router.replace("/dashboard");
      return;
    }

    setChecked(true);
  }, [session, isPending, router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">PlacementHub</h1>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium hover:underline"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Streamline Your College Placement Drives
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create tests, manage coding challenges, and conduct placement drives
            with our comprehensive platform designed specifically for colleges.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 text-lg font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 text-lg font-medium border rounded-md hover:bg-muted"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Test Creation</h3>
            <p className="text-muted-foreground">
              Create MCQ and coding tests with customizable time limits,
              proctoring options, and automatic grading.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Code Execution</h3>
            <p className="text-muted-foreground">
              Secure sandboxed environment supporting Python, Java, C++, and C
              with real-time test case validation.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Drive Management</h3>
            <p className="text-muted-foreground">
              Organize placement drives, manage registrations, and share results
              with recruiters seamlessly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Built for college placement cells</p>
        </div>
      </footer>
    </div>
  );
}
