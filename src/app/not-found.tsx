import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { House, LayoutGrid } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md flex flex-col items-center gap-6">
          <span className="font-mono-code text-7xl sm:text-8xl font-bold text-[var(--primary)] tracking-tighter">
            404
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text)] tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              The page you are looking for doesn't exist, has been removed, or the link may be broken.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              href="/"
              icon={<House className="w-4 h-4 stroke-[1.75]" />}
            >
              Back to Home
            </Button>
            <Button
              variant="secondary"
              size="md"
              href="/projects"
              icon={<LayoutGrid className="w-4 h-4 stroke-[1.75]" />}
            >
              View Projects
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
