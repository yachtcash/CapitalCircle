"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Building2,
  HandCoins,
  Briefcase,
  Sparkles,
  ScrollText,
  Users,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import { useMessaging } from "@/components/providers/MessagingProvider";
import { MEMBERS, MEMBER_TYPES, type MemberType } from "@/data/members";
import Modal from "@/components/negotiations/Modal";
import CreateDealModal from "@/components/dashboard/deals/CreateDealModal";
import { cn } from "@/lib/cn";

const inputCls =
  "w-full rounded-lg bg-white ring-1 ring-navy-900/[0.12] focus:ring-2 focus:ring-gold-500 outline-none px-3 py-2 text-sm text-navy-900 placeholder:text-navy-700/40 transition-shadow";

type ModalKind = "member" | "company" | "introduction" | "deal" | null;

export default function AdminQuickActions() {
  const [modal, setModal] = useState<ModalKind>(null);

  return (
    <section className="rounded-2xl bg-white ring-1 ring-navy-900/[0.06] p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-[0.18em] text-gold-700 font-bold mb-3">
        Quick Actions
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionBtn Icon={UserPlus} onClick={() => setModal("member")} primary>
          Create Member
        </ActionBtn>
        <ActionBtn Icon={Building2} onClick={() => setModal("company")} primary>
          Create Company
        </ActionBtn>
        <ActionLink Icon={HandCoins} href="/create-listing" primary>
          Create Opportunity
        </ActionLink>
        <ActionBtn Icon={Briefcase} onClick={() => setModal("deal")} primary>
          Create Deal
        </ActionBtn>
        <ActionBtn Icon={Sparkles} onClick={() => setModal("introduction")} primary>
          Create Introduction
        </ActionBtn>

        <span className="w-px self-stretch bg-navy-900/[0.08] mx-1" />

        <ActionLink Icon={ScrollText} href="/admin/audit">
          View Audit Log
        </ActionLink>
        <ActionLink Icon={Users} href="/admin/members">
          View Members
        </ActionLink>
        <ActionLink Icon={Building2} href="/admin/companies">
          View Companies
        </ActionLink>
        <ActionLink Icon={HandCoins} href="/admin/opportunities">
          View Opportunities
        </ActionLink>
        <ActionLink Icon={Briefcase} href="/deal-desk">
          View Deal Desk
        </ActionLink>
      </div>

      <CreateMemberModal open={modal === "member"} onClose={() => setModal(null)} />
      <CreateCompanyModal open={modal === "company"} onClose={() => setModal(null)} />
      <CreateIntroductionModal
        open={modal === "introduction"}
        onClose={() => setModal(null)}
      />
      <CreateDealModal open={modal === "deal"} onClose={() => setModal(null)} />
    </section>
  );
}

function ActionBtn({
  Icon,
  onClick,
  children,
  primary,
}: {
  Icon: typeof UserPlus;
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={btnCls(primary)}>
      {primary ? (
        <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
      ) : (
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      )}
      {children}
    </button>
  );
}

function ActionLink({
  Icon,
  href,
  children,
  primary,
}: {
  Icon: typeof UserPlus;
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link href={href} className={btnCls(primary)}>
      {primary ? (
        <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
      ) : (
        <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      )}
      {children}
      {!primary ? <ArrowUpRight className="h-3 w-3 opacity-50" strokeWidth={2.4} /> : null}
    </Link>
  );
}

function btnCls(primary?: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap",
    primary
      ? "bg-gold-500 hover:bg-gold-400 text-navy-900"
      : "bg-white ring-1 ring-navy-900/[0.1] hover:ring-navy-900/25 text-navy-900"
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.14em] text-navy-700/60 font-semibold mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function CreateMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createMember } = useMessaging();
  const router = useRouter();
  const [name, setName] = useState("");
  const [memberType, setMemberType] = useState<MemberType>("Investor");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const reset = () => {
    setName("");
    setMemberType("Investor");
    setTitle("");
    setCompany("");
    setCity("");
    setCountry("");
  };

  const submit = () => {
    if (!name.trim()) return;
    const id = createMember({
      name,
      memberType,
      title: title || undefined,
      company: company || undefined,
      city: city || undefined,
      country: country || undefined,
    });
    reset();
    onClose();
    router.push(`/admin/members?created=${id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Member"
      description="Add a member to the directory. They appear in Member Management and global search immediately."
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Create Member
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Full name">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Vega" className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Member type">
            <select value={memberType} onChange={(e) => setMemberType(e.target.value as MemberType)} className={inputCls}>
              {MEMBER_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Title">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Managing Partner" className={inputCls} />
          </Field>
          <Field label="Company">
            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Vega Capital" className={inputCls} />
          </Field>
          <Field label="City">
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Miami" className={inputCls} />
          </Field>
          <Field label="Country">
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" className={inputCls} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function CreateCompanyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createCompany } = useMessaging();
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [tagline, setTagline] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");

  const reset = () => {
    setName("");
    setIndustry("");
    setTagline("");
    setCity("");
    setCountry("");
    setWebsite("");
  };

  const submit = () => {
    if (!name.trim()) return;
    const id = createCompany({
      name,
      industry: industry || undefined,
      tagline: tagline || undefined,
      city: city || undefined,
      country: country || undefined,
      website: website || undefined,
    });
    reset();
    onClose();
    router.push(`/admin/companies?created=${id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Company"
      description="Add a company to the directory. It appears in Company Management and global search immediately."
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Create Company
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Company name">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Halcyon Resort Group" className={inputCls} />
        </Field>
        <Field label="Tagline">
          <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Boutique beachfront hospitality" className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Industry">
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Hospitality" className={inputCls} />
          </Field>
          <Field label="Website">
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className={inputCls} />
          </Field>
          <Field label="City">
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cabo San Lucas" className={inputCls} />
          </Field>
          <Field label="Country">
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Mexico" className={inputCls} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function CreateIntroductionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { submitIntroductionRequest, approveIntroduction } = useMessaging();
  const router = useRouter();
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    const target = MEMBERS.find((m) => m.id === targetId);
    if (!target || !reason.trim()) return;
    const id = submitIntroductionRequest({
      targetMemberId: target.id,
      targetMemberName: target.name,
      reason: reason.trim(),
      message: message.trim() || reason.trim(),
    });
    // Admin-created introductions land approved-ready; approve immediately.
    approveIntroduction(id, "Created and approved by admin");
    setTargetId("");
    setReason("");
    setMessage("");
    onClose();
    router.push("/admin/introductions");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Introduction"
      description="Broker an introduction between the platform and a member. It is created pre-approved."
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-bone">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!targetId || !reason.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-2.5 text-sm disabled:bg-navy-900/10 disabled:text-navy-700/40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Create Introduction
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Target member">
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className={inputCls}>
            <option value="">Select a member…</option>
            {MEMBERS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.company}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reason">
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Capital partner for hospitality raise" className={inputCls} />
        </Field>
        <Field label="Message (optional)">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Context for the introduction…" className={cn(inputCls, "resize-none leading-relaxed")} />
        </Field>
      </div>
    </Modal>
  );
}
