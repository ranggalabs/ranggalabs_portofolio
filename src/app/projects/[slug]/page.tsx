import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ArrowUpRight,
  Calendar,
  Layers,
  User,
  Building2,
  Mail,
} from "lucide-react";
import { Github } from "@/components/icons";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { TechChip } from "@/components/ui/TechChip";
import { MetricItem } from "@/components/ui/MetricItem";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { db } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.getProject(slug);

  if (!project) {
    return {
      title: "Project Not Found | Rangga Prasetya",
    };
  }

  return {
    title: project.seoTitle || `${project.title} — Case Study`,
    description: project.seoDescription || project.summary,
    openGraph: {
      title: `${project.title} — Case Study | Rangga Prasetya`,
      description: project.summary,
      images: [
        {
          url: project.coverImage,
          alt: project.coverAlt || project.title,
        },
      ],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await db.getProject(slug);

  if (!project) {
    return notFound();
  }

  const allPublished = await db.getProjects({ status: "published" });
  const relatedProjects = allPublished
    .filter((p) => p.id !== project.id)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: project.title,
        headline: project.summary,
        description: project.problem,
        author: {
          "@type": "Person",
          name: "Rangga Prasetya",
        },
        dateCreated: project.year,
        keywords: project.techStack.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ranggaprasetya.dev",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: "https://ranggaprasetya.dev/projects",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: `https://ranggaprasetya.dev/projects/${project.slug}`,
          },
        ],
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
        {/* Header & Meta Section */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 pt-10 pb-8 flex flex-col gap-6">
          <Breadcrumb
            items={[
              { label: "Projects", href: "/projects" },
              { label: project.title },
            ]}
          />

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text)] tracking-tight font-display">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed">
              {project.summary}
            </p>
          </div>

          {/* Meta Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--primary)] shrink-0 stroke-[1.75]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono-code">Role</span>
                <span className="font-medium text-[var(--text)]">{project.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--primary)] shrink-0 stroke-[1.75]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono-code">Year</span>
                <span className="font-medium text-[var(--text)]">{project.year}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--primary)] shrink-0 stroke-[1.75]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono-code">Category</span>
                <span className="font-medium text-[var(--text)]">
                  {project.categoryDisplay || project.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--primary)] shrink-0 stroke-[1.75]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono-code">Client</span>
                <span className="font-medium text-[var(--text)] truncate">
                  {project.clientName || "Proprietary"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            {project.liveUrl && (
              <Button
                variant="primary"
                size="md"
                href={project.liveUrl}
                external
                iconRight={<ArrowUpRight className="w-4 h-4 stroke-[1.75]" />}
              >
                Visit Live Site
              </Button>
            )}
            {project.repoUrl && (
              <Button
                variant="secondary"
                size="md"
                href={project.repoUrl}
                external
                icon={<Github className="w-4 h-4 stroke-[1.75]" />}
              >
                View Repository
              </Button>
            )}
          </div>
        </section>

        {/* Hero Cover Media */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 pb-12">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-md">
            <Image
              src={project.coverImage}
              alt={project.coverAlt || project.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        </section>

        {/* Case Study Content (Constrained max-w-[680px] per Stitch section 2) */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-8 border-t border-[var(--border)] flex flex-col items-center">
          <div className="w-full max-w-[680px] flex flex-col gap-12 text-[var(--text)]">
            {/* Problem Section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text)]">
                The Challenge
              </h2>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                {project.problem}
              </p>
            </div>

            {/* Solution Section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text)]">
                The Solution & Architecture
              </h2>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                {project.solution}
              </p>
            </div>

            {/* Key Metrics / Highlights */}
            {project.metrics && project.metrics.length > 0 && (
              <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <h3 className="text-sm font-semibold uppercase tracking-wider font-mono-code text-[var(--text-muted)] mb-4">
                  Measurable Impact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {project.metrics.map((metric) => (
                    <MetricItem
                      key={metric.id}
                      value={metric.value}
                      label={metric.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results Section */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text)]">
                Outcome & Delivery
              </h2>
              <p className="text-base text-[var(--text-muted)] leading-relaxed">
                {project.result}
              </p>
            </div>

            {/* Tech Stack Chips */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border)]">
              <h3 className="text-sm font-semibold uppercase tracking-wider font-mono-code text-[var(--text-muted)]">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <TechChip key={tech} label={tech} size="md" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="w-full max-w-[1200px] px-4 sm:px-6 py-12 border-t border-[var(--border)]">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-6 tracking-tight">
              Interface & Architecture Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.gallery.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)]"
                >
                  <Image
                    src={imgUrl}
                    alt={`${project.title} screenshot ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 border-t border-[var(--border)]">
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-6 tracking-tight">
              Related Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}

        {/* CTA Band */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 border-t border-[var(--border)]">
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-8 sm:p-12 flex flex-col items-center text-center gap-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text)] tracking-tight max-w-xl">
              Interested in similar architecture for your organization?
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg leading-relaxed">
              Let's talk through your technical requirements, architecture constraints, and timeline.
            </p>
            <Button
              variant="primary"
              size="lg"
              href="/contact"
              icon={<Mail className="w-4 h-4 stroke-[1.75]" />}
            >
              Start a Conversation
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
