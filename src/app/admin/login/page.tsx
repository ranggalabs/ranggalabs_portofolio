"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Mohon masukkan email dan password admin.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Email atau password yang Anda masukkan salah.");
        return;
      }

      // Successful login -> Redirect to destination
      router.push(from);
      router.refresh();
    } catch (err) {
      setError("Terjadi kesalahan koneksi saat login. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--surface)] relative">
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors focus-ring rounded-lg px-2 py-1"
      >
        <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
        <span>Kembali ke Website</span>
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
            Akses terbatas hanya untuk pengelola portofolio.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] flex items-start gap-2 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[1.75] mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Email Admin
            </label>
            <input
              type="email"
              placeholder="admin@rangga.dev"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text)]">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
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
            Masuk ke Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--surface)] flex items-center justify-center text-xs text-[var(--text-muted)]">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
