"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function TopNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "CV", href: "/cv" },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        scrolled
          ? "bg-[var(--bg)]/90 backdrop-blur-md border-[var(--border)] shadow-xs"
          : "bg-[var(--bg)] border-[var(--border)]"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Mono Title */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-ring rounded-lg p-1"
        >
          <span className="text-lg font-semibold tracking-tight text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
            Rangga Prasetya
          </span>
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[var(--border)]">
            <span className="font-mono-code text-xs text-[var(--text-muted)]">
              Fullstack Developer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[var(--text)] focus-ring rounded px-1 py-0.5 ${
                  active
                    ? "text-[var(--primary)] font-semibold"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus-ring cursor-pointer"
            aria-label="Toggle visual theme"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="w-[18px] h-[18px] stroke-[1.75]" />
            ) : (
              <Sun className="w-[18px] h-[18px] stroke-[1.75]" />
            )}
          </button>

          {/* Primary Action Button */}
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors focus-ring shadow-xs"
          >
            Contact
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors focus-ring"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 stroke-[1.75]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[1.75]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5 flex flex-col gap-3 animate-fade-in shadow-md">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-2 text-base font-medium rounded-md px-3 transition-colors ${
                  active
                    ? "bg-[var(--surface-2)] text-[var(--primary)] font-semibold"
                    : "text-[var(--text)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
            <Link
              href="/contact"
              className="w-full flex items-center justify-center h-11 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
