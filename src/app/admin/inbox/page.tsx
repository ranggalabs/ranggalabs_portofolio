"use client";

import React, { useState } from "react";
import {
  Inbox,
  Mail,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Calendar,
} from "lucide-react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { usePortfolio } from "@/context/PortfolioContext";
import { Inquiry } from "@/types";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatInquiryDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = MONTHS[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function formatInquiryDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = MONTHS[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
  } catch {
    return dateStr;
  }
}

export default function AdminInboxPage() {
  const { inquiries, markInquiryRead, deleteInquiry } = usePortfolio();

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(
    inquiries[0] || null
  );
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredInquiries = inquiries.filter((inq) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.subject && inq.subject.toLowerCase().includes(q)) ||
      inq.message.toLowerCase().includes(q)
    );
  });

  const handleSelect = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    if (inq.status === "new") {
      markInquiryRead(inq.id);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setToastMessage("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteInquiry(deleteTarget.id);
      if (selectedInquiry?.id === deleteTarget.id) {
        setSelectedInquiry(null);
      }
      setDeleteTarget(null);
      setToastMessage("Inquiry deleted.");
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      <AdminTopbar
        title="Inquiries & Messages"
        subtitle="Manage prospective client proposals and communication submissions"
      />

      {toastMessage && (
        <Toast
          type="info"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="p-6 sm:p-8 max-w-7xl flex flex-col gap-6">
        {/* Split View Container (Figma #6:6071) */}
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Left Pane: Message List (5 Cols) */}
          <div className="lg:col-span-5 border-r border-[var(--border)] flex flex-col">
            {/* Search header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.75]" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus-ring"
                />
              </div>
            </div>

            {/* List items */}
            <div className="flex-1 divide-y divide-[var(--border)] overflow-y-auto max-h-[650px]">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  return (
                    <div
                      key={inq.id}
                      onClick={() => handleSelect(inq)}
                      className={`p-4 flex flex-col gap-1.5 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[var(--surface-2)] border-l-2 border-[var(--primary)]"
                          : "hover:bg-[var(--surface-2)]/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[var(--text)] truncate">
                          {inq.name}
                        </span>
                        <StatusBadge status={inq.status} />
                      </div>

                      <span className="text-xs font-medium text-[var(--text)] truncate">
                        {inq.subject || inq.message}
                      </span>

                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {inq.message}
                      </p>

                      <span suppressHydrationWarning className="text-[10px] text-[var(--text-muted)] font-mono-code pt-1">
                        {formatInquiryDate(inq.createdAt)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[var(--text-muted)]">
                  No messages found.
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Message Detail (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col p-6 sm:p-8 justify-between">
            {selectedInquiry ? (
              <div className="flex flex-col gap-6">
                {/* Detail Header */}
                <div className="flex flex-col gap-3 pb-6 border-b border-[var(--border)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight">
                        {selectedInquiry.subject || "Message from Website Visitor"}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono-code">
                        <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span suppressHydrationWarning>{formatInquiryDateTime(selectedInquiry.createdAt)}</span>
                      </div>
                    </div>

                    <StatusBadge status={selectedInquiry.status} />
                  </div>

                  {/* Sender card */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[var(--text)]">
                        {selectedInquiry.name}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-mono-code">
                        {selectedInquiry.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyEmail(selectedInquiry.email)}
                        className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors focus-ring"
                        title="Copy email"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 stroke-[1.75]" />
                        ) : (
                          <Copy className="w-4 h-4 stroke-[1.75]" />
                        )}
                      </button>

                      <a
                        href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                          selectedInquiry.subject || "Portfolio Inquiry"
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Reply</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-line py-2">
                  {selectedInquiry.message}
                </div>

                {/* Action footer */}
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border)] mt-auto">
                  <span className="text-xs text-[var(--text-muted)]">
                    ID: <span className="font-mono-code">{selectedInquiry.id}</span>
                  </span>

                  <button
                    onClick={() => setDeleteTarget(selectedInquiry)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>Delete Inquiry</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 text-xs text-[var(--text-muted)] gap-3 h-full">
                <Inbox className="w-8 h-8 stroke-[1.75]" />
                <span>Select a message from the list to read details.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Inquiry"
        description="Are you sure you want to delete this message? This cannot be undone."
        confirmText="Delete Message"
        confirmVariant="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
