import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlacementHub - College Placement Platform",
  description: "A comprehensive platform for college placement drives with tests, coding challenges, and recruitment management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
