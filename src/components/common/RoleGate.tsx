"use client";

import { Lock } from "lucide-react";
import { useMessaging } from "@/components/providers/MessagingProvider";
import { canEngage, hasRole, type Role } from "@/lib/roles";
import EmptyState from "@/components/ui/EmptyState";
import CapitalCircleMark from "@/components/brand/CapitalCircleMark";

/**
 * Experience gate. Renders children when the live role passes; otherwise a
 * branded members-only screen with a login placeholder. Pure UX — routes and
 * workflows behind the gate are untouched.
 */
export default function RoleGate({
  min = "Member",
  title = "Members only",
  description = "This part of Capital Circle is reserved for vetted members. Sign in to browse your dashboard, message sponsors, and manage opportunities.",
  children,
}: {
  /** Minimum role required (default Member — i.e. any signed-in role). */
  min?: Role;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { currentRole, hydrated } = useMessaging();

  // SSR + pre-hydration render the gate-free tree only when the default role
  // passes; the persisted role resolves right after hydration.
  const allowed = min === "Member" ? canEngage(currentRole) : hasRole(min, currentRole);
  if (allowed) return <>{children}</>;
  void hydrated;

  // Internal gates (Admin+) greet signed-in members differently from guests.
  const internal = min !== "Member" && canEngage(currentRole);
  const action = internal
    ? { label: "My Dashboard", href: "/my" }
    : { label: "Login", href: "/login" };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream flex items-center justify-center px-5 py-16">
      <div className="max-w-md w-full rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 text-center">
        <CapitalCircleMark className="h-12 w-12 mx-auto" />
        <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.2} />
          Private area
        </div>
        <EmptyState
          className="!px-0 !py-4"
          title={internal ? "Operations team only" : title}
          description={
            internal
              ? "This area belongs to the internal operations platform. Your personal desk lives on My Dashboard."
              : description
          }
          action={action}
          secondary={{ label: "Browse marketplace", href: "/opportunities" }}
          compact
        />
      </div>
    </div>
  );
}
