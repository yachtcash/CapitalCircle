"use client";

import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Quote,
  List,
  Link2,
  Table as TableIcon,
  Eye,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Lightweight rich-text editor backed by a small Markdown subset (mirrors the
 * Deal Notes pattern — no contentEditable/WYSIWYG). Toolbar wraps the current
 * selection. Stored as a Markdown string; render with renderRichText().
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Add notes…",
  rows = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const wrap = (before: string, after = before, placeholderText = "text") => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end) || placeholderText;
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const prefixLine = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    });
  };

  const insert = (text: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const next = value.slice(0, start) + text + value.slice(start);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const link = () => {
    const url = window.prompt("Link URL", "https://");
    if (url) wrap("[", `](${url})`, "link text");
  };

  const table = () =>
    insert(
      "\n| Column A | Column B |\n| --- | --- |\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |\n"
    );

  return (
    <div className="rounded-lg ring-1 ring-navy-900/[0.12] overflow-hidden bg-white">
      <div className="flex items-center gap-0.5 px-1.5 py-1 border-b border-navy-900/[0.06] bg-bone/40 flex-wrap">
        <Tool onClick={() => wrap("**")} label="Bold"><Bold className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <Tool onClick={() => wrap("*")} label="Italic"><Italic className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <Tool onClick={() => wrap("++")} label="Underline"><UnderlineIcon className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <Divider />
        <Tool onClick={() => prefixLine("## ")} label="Heading"><Heading2 className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <Tool onClick={() => prefixLine("> ")} label="Quote"><Quote className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <Tool onClick={() => prefixLine("- ")} label="List"><List className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <Tool onClick={link} label="Link"><Link2 className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <Tool onClick={table} label="Table"><TableIcon className="h-3.5 w-3.5" strokeWidth={2.4} /></Tool>
        <div className="ml-auto">
          <Tool onClick={() => setPreview((p) => !p)} label={preview ? "Edit" : "Preview"} active={preview}>
            {preview ? <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} /> : <Eye className="h-3.5 w-3.5" strokeWidth={2.4} />}
          </Tool>
        </div>
      </div>
      {preview ? (
        <div
          className="px-3 py-2.5 text-sm min-h-[7rem] cc-richtext"
          dangerouslySetInnerHTML={{ __html: renderRichText(value) || '<p class="text-navy-700/40">Nothing to preview.</p>' }}
        />
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm text-navy-900 outline-none resize-y leading-relaxed placeholder:text-navy-700/40"
        />
      )}
    </div>
  );
}

function Tool({ onClick, label, children, active }: { onClick: () => void; label: string; children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors",
        active ? "bg-navy-900 text-white" : "text-navy-700/70 hover:bg-white hover:text-navy-900"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px bg-navy-900/10" />;
}

// ---- Renderer: Markdown subset -> safe HTML ----

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string): string {
  let out = esc(s);
  // links [text](url) — only http(s) / mailto
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, (_m, t, u) =>
    `<a href="${u}" target="_blank" rel="noopener noreferrer" class="text-gold-700 underline">${t}</a>`
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\+\+([^+]+)\+\+/g, "<u>$1</u>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return out;
}

/** Render the Markdown subset (headings, quotes, lists, tables, inline marks). */
export function renderRichText(md: string | undefined | null): string {
  if (!md || !md.trim()) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    if (buf.length) html.push(`<p>${inline(buf.join(" "))}</p>`);
    buf.length = 0;
  };

  const para: string[] = [];
  while (i < lines.length) {
    const line = lines[i];

    // table block: a line with | and the next line a --- separator
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      flushParagraph(para);
      const header = splitRow(line);
      i += 2; // skip header + separator
      const bodyRows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        bodyRows.push(splitRow(lines[i]));
        i += 1;
      }
      const thead = `<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${bodyRows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    // heading
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flushParagraph(para);
      const level = h[1].length + 1; // # -> h2 .. ### -> h4
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i += 1;
      continue;
    }

    // blockquote (consecutive)
    if (/^\s*>\s?/.test(line)) {
      flushParagraph(para);
      const quote: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
      continue;
    }

    // unordered list (consecutive)
    if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph(para);
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      html.push(`<ul>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</ul>`);
      continue;
    }

    // ordered list (consecutive)
    if (/^\s*\d+\.\s+/.test(line)) {
      flushParagraph(para);
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      html.push(`<ol>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</ol>`);
      continue;
    }

    // blank line ends a paragraph
    if (line.trim() === "") {
      flushParagraph(para);
      i += 1;
      continue;
    }

    para.push(line.trim());
    i += 1;
  }
  flushParagraph(para);
  return html.join("");
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}
