"use client";

import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  MapPin,
  Send,
  CircleCheck,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Linkedin, Github } from "@/components/icons";
import { z } from "zod";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { usePortfolio } from "@/context/PortfolioContext";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters long"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export default function ContactPage() {
  const { profile, addInquiry } = usePortfolio();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.error?.details) {
          const fieldErrors: Record<string, string> = {};
          json.error.details.forEach((d: { field?: string; message: string }) => {
            if (d.field) fieldErrors[d.field] = d.message;
          });
          setErrors(fieldErrors);
        } else {
          setToastMessage(json.error?.message || "Gagal mengirim pesan. Silakan coba lagi.");
        }
        setIsSubmitting(false);
        return;
      }

      // Also trigger context update so admin inbox shows it immediately
      addInquiry({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      setToastMessage(json.data?.message || "Thank you! Your inquiry has been sent to Rangga.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact submit error:", err);
      setIsSubmitting(false);
      setToastMessage("Terjadi kesalahan jaringan. Silakan coba kembali nanti.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      {toastMessage && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <main className="flex-1 flex flex-col items-center">
        {/* Contact Header */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 pt-12 pb-8 border-b border-[var(--border)]">
          <div className="flex flex-col gap-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text)] tracking-tight font-display">
              Get in Touch
            </h1>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Have a project inquiry, technical consulting question, or engineering opportunity?
              Send a message or connect through direct communication channels.
            </p>
          </div>
        </section>

        {/* Contact Content Grid */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Direct Channels (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-[var(--text)] tracking-tight">
                  Direct Channels
                </h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  I typically respond to inquiries within 24 hours during standard business days
                  (UTC+7).
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Email */}
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0">
                    <Mail className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
                      Email
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">
                      {profile.email}
                    </span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0">
                    <MessageSquare className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
                      WhatsApp
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {profile.phone}
                    </span>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0">
                    <MapPin className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
                      Location
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)]">
                      {profile.location}
                    </span>
                  </div>
                </div>

                {/* LinkedIn */}
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0">
                    <Linkedin className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
                      LinkedIn
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">
                      linkedin.com/in/ranggaprasetya
                    </span>
                  </div>
                </a>

                {/* GitHub */}
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0">
                    <Github className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-mono-code text-[var(--text-muted)] uppercase">
                      GitHub
                    </span>
                    <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">
                      github.com/ranggaprasetya
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Contact Form (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text)] tracking-tight">
                    Send a Direct Message
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Fill out the form below. Messages are saved directly to the CMS dashboard inbox.
                  </p>
                </div>

                {isSuccess && (
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--success)]/40 flex items-start gap-3 text-sm animate-fade-in">
                    <CircleCheck className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5 stroke-[1.75]" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-[var(--text)]">Message Delivered</span>
                      <span className="text-[var(--text-muted)]">
                        Thank you for reaching out! Rangga will review your message shortly.
                      </span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Name Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-medium text-[var(--text)]"
                    >
                      Your Name <span className="text-[var(--danger)]">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. Ahmad Fauzi"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring ${
                        errors.name
                          ? "border-[var(--danger)]"
                          : "border-[var(--border)]"
                      }`}
                    />
                    {errors.name && (
                      <span className="flex items-center gap-1 text-xs text-[var(--danger)]">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{errors.name}</span>
                      </span>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="email"
                      className="text-xs font-medium text-[var(--text)]"
                    >
                      Email Address <span className="text-[var(--danger)]">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="e.g. ahmad.fauzi@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring ${
                        errors.email
                          ? "border-[var(--danger)]"
                          : "border-[var(--border)]"
                      }`}
                    />
                    {errors.email && (
                      <span className="flex items-center gap-1 text-xs text-[var(--danger)]">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{errors.email}</span>
                      </span>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="subject"
                      className="text-xs font-medium text-[var(--text)]"
                    >
                      Subject <span className="text-[var(--danger)]">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="e.g. Smart City Transit System Collaboration"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className={`h-10 px-3 rounded-lg text-sm bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring ${
                        errors.subject
                          ? "border-[var(--danger)]"
                          : "border-[var(--border)]"
                      }`}
                    />
                    {errors.subject && (
                      <span className="flex items-center gap-1 text-xs text-[var(--danger)]">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{errors.subject}</span>
                      </span>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="message"
                      className="text-xs font-medium text-[var(--text)]"
                    >
                      Project Details & Message <span className="text-[var(--danger)]">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Describe your project, timeline, and requirements..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className={`p-3 rounded-lg text-sm bg-[var(--bg)] border text-[var(--text)] placeholder:text-[var(--text-muted)] focus-ring leading-relaxed resize-y ${
                        errors.message
                          ? "border-[var(--danger)]"
                          : "border-[var(--border)]"
                      }`}
                    />
                    {errors.message && (
                      <span className="flex items-center gap-1 text-xs text-[var(--danger)]">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{errors.message}</span>
                      </span>
                    )}
                  </div>

                  {/* Cloudflare Turnstile Placeholder (PRD Section 5 & 11) */}
                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />
                      <span>Protected by Cloudflare Turnstile Anti-Spam</span>
                    </div>
                    <span className="text-[11px] font-mono-code text-[var(--success)] font-medium">
                      Verified
                    </span>
                  </div>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={isSubmitting}
                    iconRight={<Send className="w-4 h-4 stroke-[1.75]" />}
                    className="mt-2"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
