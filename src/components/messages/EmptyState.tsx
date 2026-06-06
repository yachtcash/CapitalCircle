"use client";

import { MessageSquare } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-cream">
      <div className="text-center px-6 max-w-md">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-500 ring-1 ring-navy-900/5">
          <MessageSquare className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <h3 className="mt-5 text-lg font-semibold text-navy-900 tracking-tight">
          Select a conversation
        </h3>
        <p className="mt-2 text-sm text-navy-700/65 leading-relaxed">
          Pick a thread on the left to view the full conversation, attached
          documents, and current negotiation stage. Or open an opportunity and
          click <span className="font-semibold text-navy-900">Show Interest</span> to
          start a new one.
        </p>
      </div>
    </div>
  );
}
