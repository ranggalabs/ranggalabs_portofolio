import React from "react";
import { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { ContactSectionClient } from "@/components/sections/ContactSectionClient";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Rangga Prasetya for project inquiries, technical consulting, and software engineering opportunities.",
};

export default async function ContactPage() {
  const profile = await db.getProfile();

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="flex-1 flex flex-col items-center">
        <ContactSectionClient profile={profile} />
      </main>
      <Footer />
    </div>
  );
}
