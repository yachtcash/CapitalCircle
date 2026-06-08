function dayLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - that.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export default function DateSeparator({ iso }: { iso: string }) {
  return (
    <div className="flex items-center gap-3 my-1.5">
      <span className="flex-1 h-px bg-navy-900/[0.08]" />
      <span className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] text-navy-700/55 font-semibold bg-bone ring-1 ring-navy-900/[0.06] rounded-full px-3 py-1">
        {dayLabel(iso)}
      </span>
      <span className="flex-1 h-px bg-navy-900/[0.08]" />
    </div>
  );
}
