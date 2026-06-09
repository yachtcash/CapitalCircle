"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Paperclip, SendHorizontal, Lock, X } from "lucide-react";
import type { Attachment, AttachmentType } from "@/data/messages";
import { formatBytes } from "@/data/messages";
import { cn } from "@/lib/cn";

type Props = {
  onSend: (text: string, attachments?: Attachment[]) => void;
  placeholder?: string;
};

const ACCEPT =
  ".jpg,.jpeg,.png,.pdf,.docx,.xlsx,.pptx,.zip,image/jpeg,image/png,application/pdf";

function classifyFile(file: File): AttachmentType {
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "jpg";
    case "png":
      return "png";
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "xlsx":
      return "xlsx";
    case "pptx":
      return "pptx";
    case "zip":
      return "zip";
    default:
      // Default unknown types to pdf-styled so they render with a real icon.
      return "pdf";
  }
}

function nextAttachmentId(): string {
  // Self-contained id helper; matches the shape used by seed Attachments.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `att-${crypto.randomUUID().slice(0, 12)}`;
  }
  return `att-${Math.random().toString(36).slice(2, 10)}`;
}

export default function MessageComposer({ onSend, placeholder = "Write a message…" }: Props) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value && pending.length === 0) return;
    onSend(value, pending.length > 0 ? pending : undefined);
    setText("");
    setPending([]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFilesPicked = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      const next = files.map<Attachment>((f) => ({
        id: nextAttachmentId(),
        name: f.name,
        type: classifyFile(f),
        sizeBytes: f.size,
      }));
      setPending((prev) => [...prev, ...next]);
    }
    // Reset so the same file can be picked again later.
    e.target.value = "";
  };

  const removePending = (id: string) => {
    setPending((prev) => prev.filter((a) => a.id !== id));
  };

  const hasContent = text.trim().length > 0 || pending.length > 0;

  return (
    <form
      onSubmit={submit}
      className="border-t border-navy-900/[0.08] bg-white px-4 md:px-6 py-3 md:py-4"
    >
      {pending.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {pending.map((att) => (
            <li
              key={att.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-bone ring-1 ring-navy-900/[0.08] pl-3 pr-1.5 py-1 text-[11px] text-navy-900"
            >
              <Paperclip className="h-3 w-3 text-gold-600" strokeWidth={2.4} />
              <span className="truncate max-w-[160px]">{att.name}</span>
              <span className="text-navy-700/55">· {formatBytes(att.sizeBytes)}</span>
              <button
                type="button"
                onClick={() => removePending(att.id)}
                aria-label={`Remove ${att.name}`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-navy-900/[0.06] text-navy-700/55 hover:text-navy-900"
              >
                <X className="h-3 w-3" strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="rounded-2xl bg-bone/60 ring-1 ring-navy-900/[0.06] focus-within:ring-2 focus-within:ring-gold-500 px-3 py-2 flex items-end gap-2 transition-shadow">
        <button
          type="button"
          onClick={openFilePicker}
          aria-label="Attach files"
          title="Attach files"
          className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full text-navy-700/65 hover:text-navy-900 hover:bg-white transition-colors"
        >
          <Paperclip className="h-4 w-4" strokeWidth={2} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={onFilesPicked}
          className="hidden"
          aria-hidden
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed text-navy-900 placeholder:text-navy-700/45 max-h-32 py-2"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!hasContent}
          className={cn(
            "shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors",
            hasContent
              ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
              : "bg-navy-900/10 text-navy-700/35 cursor-not-allowed"
          )}
        >
          <SendHorizontal className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-navy-700/55">
        <Lock className="h-3 w-3 text-gold-600" strokeWidth={2.2} />
        Private — encrypted within Capital Circle. Press Enter to send, Shift+Enter for newline.
      </div>
    </form>
  );
}
