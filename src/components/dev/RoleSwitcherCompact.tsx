"use client";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { SWITCHER_ROLES, type Role } from "@/lib/roles";

/**
 * Developer role switcher (compact, sidebar footer). Mirrors the AdminShell
 * switcher but is reachable from every experience so switching to Guest or
 * Member never strands you. Testing tool only — persisted to cc:role:v1.
 */
export default function RoleSwitcherCompact() {
  const { currentRole, setCurrentRole, hydrated } = useMessaging();
  return (
    <label className="flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.14em] font-bold text-white/40">
      Preview as
      <select
        value={hydrated ? currentRole : "Super Admin"}
        onChange={(e) => setCurrentRole(e.target.value as Role)}
        aria-label="Developer role switcher"
        className="rounded-full bg-white/[0.06] ring-1 ring-white/10 hover:ring-gold-500/50 text-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-bold transition-shadow [&>option]:text-navy-900"
      >
        {SWITCHER_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </label>
  );
}
