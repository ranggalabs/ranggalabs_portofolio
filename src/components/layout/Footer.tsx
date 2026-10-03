import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Github, Linkedin } from "@/components/icons";

export function Footer() {
  return (
    <footer className="w-full bg-[var(--surface)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Brand & Location */}
        <div className="flex flex-col gap-1 max-w-xs">
          <span className="text-lg font-semibold tracking-tight text-[var(--text)]">
            Rangga Prasetya
          </span>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Fullstack Developer based in Bandung, Indonesia.
          </p>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Footer navigation"
          className="flex items-center gap-6 flex-wrap text-sm text-[var(--text-muted)]"
        >
          <Link
            href="/"
            className="hover:text-[var(--text)] transition-colors focus-ring rounded"
          >
            Home
          </Link>
          <Link
            href="/projects"
            className="hover:text-[var(--text)] transition-colors focus-ring rounded"
          >
            Projects
          </Link>
          <Link
            href="/about"
            className="hover:text-[var(--text)] transition-colors focus-ring rounded"
          >
            About
          </Link>
          <Link
            href="/cv"
            className="hover:text-[var(--text)] transition-colors focus-ring rounded"
          >
            CV
          </Link>
          <Link
            href="/contact"
            className="hover:text-[var(--text)] transition-colors focus-ring rounded"
          >
            Contact
          </Link>
        </nav>

        {/* Social and Copyright Meta */}
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/ranggaprasetya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus-ring"
              aria-label="GitHub profile"
            >
              <Github className="w-4 h-4 stroke-[1.75]" />
            </a>
            <a
              href="https://linkedin.com/in/ranggaprasetya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus-ring"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="w-4 h-4 stroke-[1.75]" />
            </a>
            <a
              href="mailto:rangga.prasetya@example.com"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus-ring"
              aria-label="Send email"
            >
              <Mail className="w-4 h-4 stroke-[1.75]" />
            </a>
          </div>

          <p className="text-xs text-[var(--text-muted)] md:text-right">
            © {new Date().getFullYear()} Rangga Prasetya. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
