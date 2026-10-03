import React from "react";
import Link from "next/link";
import {
  Download,
  ArrowRight,
  Mail,
  Layers,
  Server,
  Database,
  Cpu,
  Wrench,
} from "lucide-react";
import { Github, Linkedin } from "@/components/icons";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TerminalCard } from "@/components/ui/TerminalCard";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MetricItem } from "@/components/ui/MetricItem";
import { TechChip } from "@/components/ui/TechChip";
import { db } from "@/lib/db";

export default async function HomePage() {
  const [projects, profile] = await Promise.all([
    db.getProjects({ status: "published" }),
    db.getProfile(),
  ]);

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

  const skillCategories = [
    {
      name: "Frontend",
      icon: <Layers className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />,
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "HTML5 / CSS3"],
    },
    {
      name: "Backend & Runtime",
      icon: <Server className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />,
      skills: ["Node.js", "Express", "Go", "Python", "REST APIs", "WebSockets"],
    },
    {
      name: "Database & Cloud",
      icon: <Database className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />,
      skills: ["PostgreSQL", "Supabase", "Redis", "Docker", "Vercel", "AWS"],
    },
    {
      name: "IoT & Hardware",
      icon: <Cpu className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />,
      skills: ["ESP32", "MQTT Protocol", "Arduino", "Sensor Telemetry"],
    },
    {
      name: "Tools & Workflow",
      icon: <Wrench className="w-4 h-4 text-[var(--primary)] stroke-[1.75]" />,
      skills: ["Git", "GitHub Actions", "Linux CLI", "Figma", "Postman", "Jest", "CI/CD Pipelines"],
      spanTwo: true,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://dealwithrangga.my.id/#person",
        name: profile.name,
        jobTitle: profile.headline,
        description: profile.bio,
        url: "https://dealwithrangga.my.id",
        sameAs: [profile.github, profile.linkedin],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bandung",
          addressCountry: "ID",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://dealwithrangga.my.id/#website",
        url: "https://dealwithrangga.my.id",
        name: "Rangga Prasetya — Portfolio",
        publisher: {
          "@id": "https://dealwithrangga.my.id/#person",
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TopNav />

      <main className="flex-1 flex flex-col items-center">
        {/* HERO SECTION (Figma #1:4) */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[var(--border)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <StatusBadge status="available" customLabel={profile.availability} />

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-[var(--text)] tracking-tight leading-[1.12] font-display">
                Crafting scalable web
                <br className="hidden sm:inline" /> systems & smart digital
                <br className="hidden sm:inline" /> solutions.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-[620px]">
                {profile.bio}
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  href="/projects"
                  iconRight={<ArrowRight className="w-4 h-4 stroke-[1.75]" />}
                >
                  View Projects
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  href="/cv"
                  icon={<Download className="w-4 h-4 stroke-[1.75]" />}
                >
                  Download CV
                </Button>
              </div>

              {/* Social Icon Buttons Row */}
              <div className="flex items-center gap-2 pt-2 text-[var(--text-muted)]">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors focus-ring"
                  aria-label="GitHub profile"
                >
                  <Github className="w-4 h-4 stroke-[1.75]" />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors focus-ring"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin className="w-4 h-4 stroke-[1.75]" />
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors focus-ring"
                  aria-label="Send Email"
                >
                  <Mail className="w-4 h-4 stroke-[1.75]" />
                </a>
              </div>
            </div>

            {/* Right Column: Terminal Workspace Card (5 Cols) */}
            <div className="lg:col-span-5 w-full">
              <TerminalCard />
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS SECTION (Figma #1:73) */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 lg:py-24 border-b border-[var(--border)]">
          <SectionHeader
            title="Featured Projects"
            description="Selected works spanning smart city infrastructure, IoT platforms, and productivity tools."
            actionText="View all projects"
            actionHref="/projects"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, idx) => (
              <ProjectCard key={project.id} project={project} priority={idx === 0} />
            ))}
          </div>
        </section>

        {/* SKILLS & TECHNOLOGIES SECTION (Figma #1:160) */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 lg:py-24 border-b border-[var(--border)]">
          <div className="flex flex-col gap-2 pb-8 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text)] tracking-tight">
              Skills & Technologies
            </h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Core competencies and engineering tools utilized across production environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category) => (
              <div
                key={category.name}
                className={`p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-4 ${
                  category.spanTwo ? "lg:col-span-2" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {category.name}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {category.skills.map((skill) => (
                    <TechChip key={skill} label={skill} size="md" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HIGHLIGHTS / METRICS SECTION (Figma #1:265) */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 lg:py-24 border-b border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            <MetricItem
              value="3+"
              label="Projects Delivered"
              description="Production web apps, municipal client platforms, and open source utilities."
              className="md:pr-8"
            />
            <MetricItem
              value="3+"
              label="Years Engineering Experience"
              description="Hands-on architecture in fullstack development and embedded IoT solutions."
              className="pt-6 md:pt-0 md:px-8"
            />
            <MetricItem
              value="99.9%"
              label="Performance & Accessibility"
              description="Strict target compliance with WCAG AA standards and sub-second Lighthouse scores."
              className="pt-6 md:pt-0 md:pl-8"
            />
          </div>
        </section>

        {/* CTA BAND (Figma #1:294) */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 lg:py-24">
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 sm:p-12 lg:p-16 flex flex-col items-center text-center gap-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--text)] tracking-tight max-w-xl">
              Have a project in mind or looking for a developer?
            </h2>
            <p className="text-base text-[var(--text-muted)] max-w-lg leading-relaxed">
              I am currently available for freelance opportunities, full-time engineering roles, and technical consulting.
            </p>
            <Button
              variant="primary"
              size="lg"
              href="/contact"
              icon={<Mail className="w-4 h-4 stroke-[1.75]" />}
            >
              Get in touch
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
