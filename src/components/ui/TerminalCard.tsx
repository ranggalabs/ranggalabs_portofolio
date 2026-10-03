import React from "react";
import { Terminal } from "lucide-react";

export function TerminalCard() {
  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-xs font-mono-code text-xs leading-relaxed">
      {/* Window Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[var(--border)] hover:bg-red-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-[var(--border)] hover:bg-yellow-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-[var(--border)] hover:bg-green-400 transition-colors" />
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text)] text-xs font-medium tracking-wide">
          <Terminal className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>rangga@station: ~/portfolio</span>
        </div>
        <span className="text-xs font-medium text-[var(--text-muted)]">zsh</span>
      </div>

      {/* Terminal Body */}
      <div className="p-5 flex flex-col gap-4 text-[var(--text)]">
        {/* Command 1: cat profile.json */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <span className="text-[var(--primary)] font-semibold">$</span>
            <span className="text-[var(--text)] font-medium">cat profile.json</span>
          </div>

          <div className="pl-3 border-l-2 border-[var(--border)] flex flex-col gap-1 text-xs">
            <div>
              <span className="text-[var(--primary)] font-medium">"name"</span>:{" "}
              <span className="text-[var(--text)]">"Rangga Prasetya"</span>,
            </div>
            <div>
              <span className="text-[var(--primary)] font-medium">"role"</span>:{" "}
              <span className="text-[var(--text)]">"Fullstack Developer"</span>,
            </div>
            <div>
              <span className="text-[var(--primary)] font-medium">"location"</span>:{" "}
              <span className="text-[var(--text)]">"Bandung, Indonesia (UTC+7)"</span>,
            </div>
            <div>
              <span className="text-[var(--primary)] font-medium">"stack"</span>: [
              <span className="text-[var(--text)]">"TypeScript"</span>,{" "}
              <span className="text-[var(--text)]">"Go"</span>,{" "}
              <span className="text-[var(--text)]">"ESP32"</span>,{" "}
              <span className="text-[var(--text)]">"PostgreSQL"</span>],
            </div>
            <div>
              <span className="text-[var(--primary)] font-medium">"status"</span>:{" "}
              <span className="text-[var(--success)] font-semibold">"ready_for_dispatch"</span>
            </div>
          </div>
        </div>

        {/* Command 2: health check */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[var(--primary)] font-semibold">$</span>
            <span className="text-[var(--text)] font-medium">
              curl -s https://api.rangga.dev/health
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--success)] bg-[var(--surface-2)] px-3 py-1.5 rounded-md border border-[var(--border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span>{`{"status":"healthy","uptime":"99.99%","ping":"18ms"}`}</span>
          </div>
        </div>

        {/* Command prompt & blinking cursor */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[var(--primary)] font-semibold">$</span>
          <span className="inline-block w-2 h-4 bg-[var(--primary)] animate-cursor-blink" />
        </div>
      </div>
    </div>
  );
}
