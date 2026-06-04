import PageShell from "@/components/PageShell";
import { Inbox, Search, Filter } from "lucide-react";

type Thread = {
  id: string;
  with: string;
  role: string;
  subject: string;
  preview: string;
  ago: string;
  unread: boolean;
  initials: string;
};

const threads: Thread[] = [
  {
    id: "m1",
    with: "Aurora Capital Partners",
    role: "Sponsor · Miami Tower JV",
    subject: "Tranche allocation question",
    preview:
      "Appreciate the term sheet. Quick clarification on the LP tranche and waterfall before our IC meets Thursday…",
    ago: "12m",
    unread: true,
    initials: "AC",
  },
  {
    id: "m2",
    with: "Pacific Coast Holdings",
    role: "Sponsor · Cabo Hotel Expansion",
    subject: "Site visit availability",
    preview:
      "We have block-out dates for site visits the second week of next month. Bringing your construction lead?",
    ago: "2h",
    unread: true,
    initials: "PC",
  },
  {
    id: "m3",
    with: "Mariana Reyes",
    role: "Riviera Land Group",
    subject: "Punta Mita parcels — survey docs",
    preview:
      "Surveyor delivered the updated topo last Friday. Sending across with the entitlement letter, let me know…",
    ago: "1d",
    unread: false,
    initials: "MR",
  },
  {
    id: "m4",
    with: "Helios Infrastructure",
    role: "Sponsor · Sonora Solar",
    subject: "Updated PPA terms",
    preview:
      "Final offtaker terms came in this morning at 0.4¢ above our base case. Modeling impact on IRR now.",
    ago: "2d",
    unread: false,
    initials: "HI",
  },
  {
    id: "m5",
    with: "Confidential Seller",
    role: "Dallas Logistics Co.",
    subject: "NDA executed — data room access",
    preview:
      "NDA is countersigned. Login credentials for the deal room will arrive separately within the hour.",
    ago: "4d",
    unread: false,
    initials: "CS",
  },
];

export default function MessagesPage() {
  return (
    <PageShell
      eyebrow="Inbox"
      title="Messages"
      subtitle="Private conversations with members on deals you've opened or posted."
    >
      <div className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 border-b border-navy-900/[0.06]">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-700/50"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search messages"
              className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none pl-9 pr-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40"
            />
          </div>
          <button className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-bone hover:bg-bone/70 text-navy-900 text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors">
            <Filter className="h-3.5 w-3.5" strokeWidth={2.2} />
            Filter
          </button>
        </div>

        <ul className="divide-y divide-navy-900/[0.06]">
          {threads.map((t) => (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                className="flex gap-3 md:gap-4 p-4 md:p-5 hover:bg-bone/40 transition-colors"
              >
                <div className="shrink-0 h-11 w-11 rounded-full bg-navy-900 text-gold-500 ring-1 ring-navy-900/5 flex items-center justify-center text-sm font-semibold tracking-wide">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="font-semibold text-navy-900 text-sm truncate">
                      {t.with}
                    </div>
                    <div className="text-[11px] text-navy-700/55 shrink-0">{t.ago}</div>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-gold-600 font-semibold mt-0.5 truncate">
                    {t.role}
                  </div>
                  <div className="mt-1.5 text-sm font-medium text-navy-900 truncate">
                    {t.subject}
                  </div>
                  <div className="mt-0.5 text-sm text-navy-700/65 line-clamp-1">
                    {t.preview}
                  </div>
                </div>
                {t.unread ? (
                  <span className="self-start mt-2 h-2 w-2 rounded-full bg-gold-500 shrink-0" />
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        <div className="px-5 py-6 text-center bg-bone/30">
          <Inbox className="h-5 w-5 text-navy-700/40 mx-auto" strokeWidth={1.8} />
          <p className="mt-2 text-xs text-navy-700/55">
            You&apos;ve reached the end of your inbox.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
