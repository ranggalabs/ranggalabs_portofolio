import React from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Download,
  Mail,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { db } from "@/lib/db";

export default async function AboutPage() {
  const profile = await db.getProfile();

  const experiences =
    profile.experiences && profile.experiences.length > 0
      ? profile.experiences
      : [
          {
            role: "Lead Fullstack & IoT Engineer",
            company: "Rangga Labs & Municipal Initiatives",
            period: "2023 — Present",
            location: "Bandung, Indonesia",
            description:
              "Architecting distributed transit telematics (Angkot To School) for Dishub Kota Bandung, smart parking sensor arrays with ESP32 edge telemetry, and fullstack cloud architectures.",
          },
          {
            role: "Fullstack Web Developer",
            company: "Digital Studio & Freelance",
            period: "2022 — 2023",
            location: "Bandung, Indonesia",
            description:
              "Built custom web applications, Chrome developer extensions (Threadibility), interactive quiz systems, and high-performance client websites using React, Next.js, and PostgreSQL.",
          },
          {
            role: "Embedded Systems & Firmware Developer",
            company: "IoT & Hardware Projects",
            period: "2021 — 2022",
            location: "Bandung, Indonesia",
            description:
              "Designed micro-controller firmware on ESP32/Arduino, calibrated multi-sensor telemetry (PMS5003, BME280), and developed MQTT communication bridges with cloud databases.",
          },
        ];

  const education =
    profile.education && profile.education.length > 0
      ? profile.education
      : [
          {
            degree: "Bachelor of Computer Science / Informatics",
            institution: "Universitas di Bandung",
            period: "2019 — 2023",
            description:
              "Focused on Distributed Systems, Network Architecture, Software Engineering, and Internet of Things.",
          },
        ];

  const certifications =
    profile.certifications && profile.certifications.length > 0
      ? profile.certifications
      : [
          {
            title: "Fullstack Web Architecture & Cloud Systems",
            issuer: "Advanced Engineering Certification",
            year: "2023",
          },
          {
            title: "Embedded Systems with ESP32 & FreeRTOS",
            issuer: "Hardware & IoT Systems",
            year: "2022",
          },
          {
            title: "PostgreSQL Database Performance Tuning",
            issuer: "Database Engineering Institute",
            year: "2022",
          },
        ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      <main className="flex-1 flex flex-col items-center">
        {/* Profile Hero Header */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 pt-12 pb-16 border-b border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* Avatar Column */}
            <div className="md:col-span-4 flex flex-col items-center md:items-start gap-4">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--border)] shadow-md">
                <Image
                  src={profile.photo || "/images/profile_rangga-7ca715.png"}
                  alt={profile.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono-code text-[var(--text-muted)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)] stroke-[1.75]" />
                <span>{profile.location}</span>
              </div>
            </div>

            {/* Profile Intro Column */}
            <div className="md:col-span-8 flex flex-col items-start gap-5">
              <StatusBadge status="available" customLabel={profile.availability} />

              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text)] tracking-tight font-display">
                  {profile.name}
                </h1>
                <p className="text-lg font-medium text-[var(--primary)] font-mono-code">
                  {profile.headline}
                </p>
              </div>

              <div className="flex flex-col gap-3 text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
                <p>
                  I am a passionate software engineer based in Bandung, Indonesia, dedicated to building
                  high-reliability fullstack web applications and connected IoT hardware systems.
                </p>
                <p>
                  My engineering philosophy focuses on performance, accessibility (WCAG AA), and clean
                  software architecture. Whether architecting real-time municipal transit systems,
                  developing low-latency embedded sensors on ESP32, or crafting intuitive user interfaces,
                  I take pride in delivering resilient, human-centered digital products.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  href="/cv"
                  icon={<Download className="w-4 h-4 stroke-[1.75]" />}
                >
                  Download CV
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  href="/contact"
                  icon={<Mail className="w-4 h-4 stroke-[1.75]" />}
                >
                  Contact Me
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-8">
            <Briefcase className="w-6 h-6 text-[var(--primary)] stroke-[1.75]" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text)] tracking-tight">
              Work & Engineering Experience
            </h2>
          </div>

          <div className="flex flex-col gap-6 max-w-3xl">
            {experiences.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-2 relative pl-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {exp.role}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono-code text-[var(--text-muted)]">
                    <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>{exp.period}</span>
                  </div>
                </div>

                <div className="text-sm font-medium text-[var(--primary)]">
                  {exp.company} • <span className="text-[var(--text-muted)]">{exp.location}</span>
                </div>

                <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-1">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Education & Certifications Section */}
        <section className="w-full max-w-[1200px] px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Education */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-[var(--primary)] stroke-[1.75]" />
                <h2 className="text-2xl font-semibold text-[var(--text)] tracking-tight">
                  Education
                </h2>
              </div>

              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-[var(--text)]">
                      {edu.degree}
                    </h3>
                    <span className="text-xs font-mono-code text-[var(--text-muted)]">
                      {edu.period}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-[var(--primary)]">
                    {edu.institution}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-1">
                    {edu.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[var(--primary)] stroke-[1.75]" />
                <h2 className="text-2xl font-semibold text-[var(--text)] tracking-tight">
                  Certifications & Focus
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-[var(--text)]">
                        {cert.title}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {cert.issuer}
                      </span>
                    </div>
                    <span className="text-xs font-mono-code text-[var(--text-muted)] shrink-0">
                      {cert.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
