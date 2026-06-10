"use client";

import { useState } from "react";
import { Bold, Italic, List, Link as LinkIcon, Send } from "lucide-react";
import type { DealNote } from "@/data/deals";
import { cn } from "@/lib/cn";
import { formatDate } from "./DealBadges";

/**
 * Lightweight rich-note compositor.
 *
 * Notes are stored as Markdown strings. The toolbar buttons wrap or prepend
 * the appropriate markers around the user's selected text; no WYSIWYG layer
 * is involved, which keeps storage portable and rendering predictable.
 */
export default function DealNotes({
  notes,
  onAdd,
}: {
  notes: DealNote[];
  onAdd: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [areaRef, setAreaRef] = useState<HTMLTextAreaElement | null>(null);

  const wrap = (left: string, right = left, placeholder = "text") => {
    if (!areaRef) return;
    const start = areaRef.selectionStart ?? draft.length;
    const end = areaRef.selectionEnd ?? draft.length;
    const before = draft.slice(0, start);
    const selected = draft.slice(start, end) || placeholder;
    const after = draft.slice(end);
    const next = `${before}${left}${selected}${right}${after}`;
    setDraft(next);
    // Move caret just after the wrapped section
    requestAnimationFrame(() => {
      const pos = before.length + left.length + selected.length + right.length;
      areaRef.focus();
      areaRef.setSelectionRange(pos, pos);
    });
  };

  const insertList = () => {
    if (!areaRef) return;
    const start = areaRef.selectionStart ?? draft.length;
    const before = draft.slice(0, start);
    const after = draft.slice(start);
    const prefix = before.endsWith("\n") || before.length === 0 ? "" : "\n";
    const next = `${before}${prefix}- ${after}`;
    setDraft(next);
  };

  const insertLink = () => {
    const url = window.prompt("Link URL");
    if (!url) return;
    wrap("[", `](${url})`, "link text");
  };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white ring-1 ring-navy-900/[0.08] overflow-hidden">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-navy-900/[0.06] bg-bone/60">
          <ToolbarBtn onClick={() => wrap("**", "**", "bold")} label="Bold">
            <Bold className="h-3.5 w-3.5" strokeWidth={2.4} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => wrap("*", "*", "italic")} label="Italic">
            <Italic className="h-3.5 w-3.5" strokeWidth={2.4} />
          </ToolbarBtn>
          <ToolbarBtn onClick={insertList} label="Bullet list">
            <List className="h-3.5 w-3.5" strokeWidth={2.4} />
          </ToolbarBtn>
          <ToolbarBtn onClick={insertLink} label="Link">
            <LinkIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
          </ToolbarBtn>
          <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
            Markdown supported
          </span>
        </div>
        <textarea
          ref={setAreaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="Add a note — **bold**, *italic*, - bullets, [link](https://...)"
          className="w-full bg-transparent px-4 py-3 outline-none text-sm text-navy-900 placeholder:text-navy-700/40 resize-none leading-relaxed"
        />
        <div className="flex items-center justify-end px-3 py-2 border-t border-navy-900/[0.06] bg-bone/30">
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim()}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
              draft.trim()
                ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
                : "bg-navy-900/10 text-navy-700/40 cursor-not-allowed"
            )}
          >
            <Send className="h-3.5 w-3.5" strokeWidth={2.4} />
            Add note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-navy-700/55">
          No notes yet. The first note becomes the running record for this deal.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-4 md:p-5"
            >
              <header className="flex items-center justify-between gap-2 mb-2 text-xs">
                <span className="font-semibold text-navy-900">
                  {n.authorName}
                </span>
                <span className="uppercase tracking-[0.14em] text-navy-700/55 font-semibold">
                  {formatDate(n.createdAt)}
                </span>
              </header>
              <div
                className="text-sm text-navy-700/85 leading-relaxed prose-note"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(n.text) }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ToolbarBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-navy-700 hover:text-navy-900 hover:bg-white transition-colors"
    >
      {children}
    </button>
  );
}

// ---- Lightweight markdown renderer ----

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Render a tiny subset of Markdown safely: **bold**, *italic*, [link](url),
 * and `-` bullet lists. Everything else is escaped.
 */
function renderMarkdown(input: string): string {
  // Block: bullet lists (lines starting with `- `).
  const lines = input.split(/\n/);
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const escaped = escapeHtml(raw);
    if (/^\s*-\s+/.test(escaped)) {
      const item = escaped.replace(/^\s*-\s+/, "");
      if (!inList) {
        inList = true;
        out.push("<ul>");
      }
      out.push(`<li>${inlineMd(item)}</li>`);
    } else {
      if (inList) {
        inList = false;
        out.push("</ul>");
      }
      if (escaped.trim().length === 0) {
        out.push("<br/>");
      } else {
        out.push(`<p>${inlineMd(escaped)}</p>`);
      }
    }
  }
  if (inList) out.push("</ul>");
  return out.join("");
}

function inlineMd(s: string): string {
  // Links: [text](url) — url restricted to http(s) and mailto.
  s = s.replace(
    /\[([^\]]+)\]\(((?:https?:|mailto:)[^)\s]+)\)/g,
    (_, text, url) =>
      `<a href="${url}" target="_blank" rel="noopener" class="text-gold-700 hover:text-gold-600 underline">${text}</a>`
  );
  // Bold: **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  return s;
}
