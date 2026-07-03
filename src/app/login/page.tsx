import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import CapitalCircleMark from "@/components/brand/CapitalCircleMark";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Login",
  description: "Member access to the Capital Circle private marketplace.",
};

/**
 * Authentication placeholder — auth is a future phase. This page only
 * reserves the route and presents the branded entry point.
 */
export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-cream flex items-center justify-center px-5 py-16">
      <div className="max-w-md w-full rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-8 text-center">
        <CapitalCircleMark className="h-14 w-14 mx-auto" />
        <div className="mt-5 text-[11px] uppercase tracking-[0.2em] text-gold-600 font-semibold">
          Capital Circle
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-navy-900 tracking-tight">
          Member login
        </h1>
        <p className="mt-3 text-sm text-navy-700/70 leading-relaxed">
          Secure member authentication arrives in an upcoming release. Membership
          is invite-only — vetted investors, developers, and operators.
        </p>
        <div className="mt-6 rounded-xl bg-bone/60 ring-1 ring-navy-900/[0.05] p-4 text-left space-y-2.5 opacity-60 select-none" aria-hidden>
          <div className="h-10 rounded-lg bg-white ring-1 ring-navy-900/[0.08] px-3 flex items-center text-sm text-navy-700/40">
            Email address
          </div>
          <div className="h-10 rounded-lg bg-white ring-1 ring-navy-900/[0.08] px-3 flex items-center text-sm text-navy-700/40">
            Password
          </div>
        </div>
        <div className="mt-4">
          <Button fullWidth disabled title="Authentication launches in a future phase">
            Sign in — coming soon
          </Button>
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-navy-700/55">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-600" strokeWidth={2.2} />
          Invite-only · vetted members
        </div>
        <div className="mt-5 pt-5 border-t border-navy-900/[0.06]">
          <Button variant="outline" fullWidth href="/opportunities">
            Continue browsing the marketplace
          </Button>
        </div>
      </div>
    </div>
  );
}
