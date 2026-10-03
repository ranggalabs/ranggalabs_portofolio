import React from "react";
import { Metadata } from "next";
import { Download, ArrowUpRight, FileText, CheckCircle2, ShieldCheck, Calendar, Eye } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [resume, profile] = await Promise.all([
    db.getResume(),
    db.getProfile(),
  ]);

  return {
    title: `Curriculum Vitae — ${profile.name} (${resume.versionLabel})`,
    description: `Official Curriculum Vitae of ${profile.name} (${profile.headline}). Updated ${resume.updatedAt}.`,
    openGraph: {
      title: `Curriculum Vitae — ${profile.name}`,
      description: `Official Curriculum Vitae of ${profile.name} (${profile.headline}). Version: ${resume.versionLabel}.`,
    },
  };
}

export default async function CVPage() {
  const [resumeSettings, profile] = await Promise.all([
    db.getResume(),
    db.getProfile(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      <main className="flex-1 flex flex-col items-center">
        {/* CV Header */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 pt-12 pb-8 border-b border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-mono-code text-[var(--text-muted)]">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-semibold text-[var(--primary)]">
                  {resumeSettings.versionLabel}
                </span>
                <span>• Terakhir diperbarui: {resumeSettings.updatedAt}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text)] tracking-tight font-display">
                Curriculum Vitae
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-xl">
                Dokumen CV resmi mencakup pengalaman fullstack engineering, arsitektur telematics IoT,
                dan riwayat proyek produksi.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                href="/cv.pdf"
                download={resumeSettings.fileName}
                icon={<Download className="w-4 h-4 stroke-[1.75]" />}
              >
                Download PDF
              </Button>

              <Button
                variant="secondary"
                size="md"
                href="/cv.pdf"
                external
                iconRight={<ArrowUpRight className="w-4 h-4 stroke-[1.75]" />}
              >
                Buka di Tab Baru
              </Button>
            </div>
          </div>
        </section>

        {/* Embedded Document Preview Area */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-12 flex flex-col items-center gap-8">
          <div className="w-full max-w-4xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg overflow-hidden flex flex-col">
            {/* Document Header Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-[var(--surface-2)] border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />
                <span className="font-mono-code font-semibold text-[var(--text)] truncate max-w-xs sm:max-w-md">
                  {resumeSettings.fileName}
                </span>
                <span className="font-mono-code">({resumeSettings.fileSize})</span>
              </div>

              <div className="flex items-center gap-2 font-mono-code text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)] stroke-[1.75]" />
                <span className="hidden sm:inline">Official Verified Document</span>
                <span className="px-2 py-0.5 rounded bg-[var(--success)]/10 text-[var(--success)] font-medium">
                  {resumeSettings.versionLabel}
                </span>
              </div>
            </div>

            {/* Live Interactive PDF Viewer Frame with Graceful Fallback */}
            <div className="w-full bg-[var(--surface-2)] flex flex-col items-center border-b border-[var(--border)] min-h-[500px]">
              <object
                data="/cv.pdf#toolbar=1&navpanes=0"
                type="application/pdf"
                className="w-full h-[750px] sm:h-[850px] border-none bg-white dark:bg-[#1a1e24]"
                aria-label="Pratinjau Dokumen CV PDF"
              >
                <div className="flex flex-col items-center justify-center p-12 text-center gap-4 text-[var(--text-muted)] w-full h-[400px]">
                  <FileText className="w-12 h-12 text-[var(--primary)] stroke-[1.5]" />
                  <div className="flex flex-col gap-1 max-w-sm">
                    <span className="text-sm font-semibold text-[var(--text)]">Pratinjau PDF Langsung</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Browser Anda tidak menampilkan pratinjau inline PDF. Anda dapat mengunduh atau membuka dokumen langsung.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      href="/cv.pdf"
                      download={resumeSettings.fileName}
                      icon={<Download className="w-4 h-4 stroke-[1.75]" />}
                    >
                      Download PDF ({resumeSettings.fileSize})
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      href="/cv.pdf"
                      external
                      iconRight={<ArrowUpRight className="w-4 h-4 stroke-[1.75]" />}
                    >
                      Buka di Tab Baru
                    </Button>
                  </div>
                </div>
              </object>
            </div>


            {/* Bottom Download Bar */}
            <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-[var(--text-muted)]">
                Perlu salinan kustom atau referensi teknis? Hubungi langsung via formulir kontak.
              </span>
              <Button
                variant="primary"
                size="sm"
                href="/cv.pdf"
                download={resumeSettings.fileName}
                icon={<Download className="w-3.5 h-3.5 stroke-[1.75]" />}
              >
                Download Official PDF
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
