import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dealwithrangga.my.id"),
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
  authors: [{ name: "Rangga Prasetya", url: "https://dealwithrangga.my.id" }],
  creator: "Rangga Prasetya",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dealwithrangga.my.id",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/images/ranggalabs.png" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-[var(--on-primary)]">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
