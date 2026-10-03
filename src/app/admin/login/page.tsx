"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // In this client demonstration, any valid email and password format lets the admin into the CMS
      setIsLoading(false);
      router.push("/admin");
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail("admin@rangga.dev");
    setPassword("portfolio-master-2024");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--surface)] relative">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors focus-ring rounded-lg px-2 py-1"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
        <span>Back to Public Site</span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-xl p-8 flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-md">
            <Shield className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text)] tracking-tight mt-2">
            CMS Admin Portal
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Single-user management panel for projects, media, and site content.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[1.75]" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@rangga.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--text)]">
                Password
              </label>
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            type="submit"
            isLoading={isLoading}
            iconRight={<ArrowRight className="w-4 h-4 stroke-[1.75]" />}
            className="w-full mt-2"
          >
            Sign In to CMS
          </Button>

          {/* Quick Demo Helper */}
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-[var(--primary)] hover:underline cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>Auto-fill Demo Credentials</span>
          </button>
        </form>
      </div>
    </div>
  );
}
