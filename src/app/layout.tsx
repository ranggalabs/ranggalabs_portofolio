import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  metadataBase: new URL("https://ranggaprasetya.dev"),
  title: {
    default: "Rangga Prasetya — Fullstack Developer",
    template: "%s | Rangga Prasetya",
  },
  description:
    "Fullstack developer with a passion for high-performance web applications, IoT integration, and human-centered user experiences based in Bandung, Indonesia.",
  keywords: [
    "Fullstack Developer",
    "React",
    "Next.js",
    "TypeScript",
    "IoT",
    "ESP32",
    "PostgreSQL",
    "Bandung",
    "Indonesia",
  ],
  authors: [{ name: "Rangga Prasetya", url: "https://ranggaprasetya.dev" }],
  creator: "Rangga Prasetya",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ranggaprasetya.dev",
    siteName: "Rangga Prasetya Portfolio",
    title: "Rangga Prasetya — Fullstack Developer",
    description:
      "Crafting scalable web systems & smart digital solutions based in Bandung, Indonesia.",
    images: [
      {
        url: "/images/angkot_to_school-63d994.png",
        width: 1200,
        height: 630,
        alt: "Rangga Prasetya Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rangga Prasetya — Fullstack Developer",
    description:
      "Crafting scalable web systems & smart digital solutions based in Bandung, Indonesia.",
    images: ["/images/angkot_to_school-63d994.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/images/ranggalabs.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D10" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialData = undefined;
  try {
    const [profile, projects, resumeSettings, siteSettings] = await Promise.all([
      db.getProfile(),
      db.getProjects({ status: "all" }),
      db.getResume(),
      db.getSettings(),
    ]);
    initialData = {
      profile,
      projects,
      resumeSettings,
      siteSettings,
    };
  } catch (err) {
    console.error("RootLayout failed to retrieve initial db data:", err);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/images/ranggalabs.png" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-[var(--on-primary)]">
        <AppProviders initialData={initialData}>{children}</AppProviders>
      </body>
    </html>
  );
}
