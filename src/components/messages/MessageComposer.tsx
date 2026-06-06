"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Paperclip, SendHorizontal, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  onSend: (text: string) => void;
  placeholder?: string;
};

export default function MessageComposer({ onSend, placeholder = "Write a message…" }: Props) {
  const [text, setText] = useState("");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border-t border-navy-900/[0.08] bg-white px-4 md:px-6 py-3 md:py-4"
    >
      <div className="rounded-2xl bg-bone/60 ring-1 ring-navy-900/[0.06] focus-within:ring-2 focus-within:ring-gold-500 px-3 py-2 flex items-end gap-2 transition-shadow">
        <button
          type="button"
          aria-label="Attach files"
          title="Attach files"
          className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full text-navy-700/65 hover:text-navy-900 hover:bg-white transition-colors"
        >
          <Paperclip className="h-4 w-4" strokeWidth={2} />
        </button>
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
          disabled={!text.trim()}
          className={cn(
            "shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full transition-colors",
            text.trim()
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
