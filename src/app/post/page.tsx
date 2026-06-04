import PageShell from "@/components/PageShell";
import { categories } from "@/data/categories";
import { Info } from "lucide-react";

export default function PostOpportunityPage() {
  return (
    <PageShell
      eyebrow="New Listing"
      title="Post an Opportunity"
      subtitle="Share the essentials. Vetted members will reach out through Capital Circle messaging."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <form className="bg-white rounded-2xl ring-1 ring-navy-900/[0.06] p-5 md:p-8 space-y-6">
          <Field label="Opportunity title" required>
            <input
              type="text"
              placeholder="e.g. Beachfront Boutique Hotel — 42 Keys"
              className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Category" required>
              <select className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900">
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location" required>
              <input
                type="text"
                placeholder="City, Country"
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Investment range">
              <input
                type="text"
                placeholder="$5M – $10M"
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40"
              />
            </Field>
            <Field label="Expected return">
              <input
                type="text"
                placeholder="18% IRR / 2.4x MOIC"
                className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40"
              />
            </Field>
          </div>

          <Field
            label="Summary"
            required
            hint="2–4 sentences. Avoid confidential details until you connect with interested members."
          >
            <textarea
              rows={5}
              placeholder="Describe the opportunity, deal structure, and what you're looking for…"
              className="w-full rounded-lg bg-bone/60 ring-1 ring-navy-900/5 focus:ring-2 focus:ring-gold-500 outline-none px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/40 resize-none"
            />
          </Field>

          <Field label="Visibility">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Radio name="visibility" defaultChecked title="Open to all members" desc="Visible to every vetted member of Capital Circle." />
              <Radio name="visibility" title="Private invitation" desc="Only members you invite can view the full listing." />
            </div>
          </Field>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              className="rounded-full bg-navy-900 hover:bg-navy-800 text-white font-semibold px-6 py-3 text-sm transition-colors"
            >
              Submit for Review
            </button>
            <button
              type="button"
              className="rounded-full bg-bone hover:bg-bone/70 text-navy-900 font-semibold px-6 py-3 text-sm transition-colors"
            >
              Save as Draft
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="bg-navy-900 text-white rounded-2xl p-5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gold-500 font-semibold">
              How posting works
            </div>
            <ol className="mt-4 space-y-3 text-sm text-white/80">
              {[
                "Submit the listing — takes about 4 minutes.",
                "Our team reviews within 24 hours for quality and fit.",
                "Once approved, it appears in the marketplace and weekly digest.",
                "Interested members message you privately through Capital Circle.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 h-5 w-5 rounded-full bg-gold-500/15 text-gold-400 ring-1 ring-gold-500/40 text-[11px] font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gold-500/10 ring-1 ring-gold-500/30 rounded-2xl p-5 flex gap-3">
            <Info className="h-5 w-5 text-gold-700 shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-sm text-navy-900/90">
              <div className="font-semibold">Heads up</div>
              <p className="mt-1 text-navy-900/70 leading-relaxed">
                Listings posted Mon–Wed receive 3x more views than weekend posts.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.14em] text-navy-700/70 font-semibold mb-2">
        {label}
        {required ? <span className="text-gold-600 ml-1">*</span> : null}
      </span>
      {children}
      {hint ? <span className="block mt-1.5 text-xs text-navy-700/55">{hint}</span> : null}
    </label>
  );
}

function Radio({
  name,
  title,
  desc,
  defaultChecked,
}: {
  name: string;
  title: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex gap-3 rounded-xl bg-bone/60 ring-1 ring-navy-900/5 px-4 py-3 cursor-pointer hover:ring-gold-500/50 has-[input:checked]:ring-gold-500 has-[input:checked]:bg-gold-500/5 transition">
      <input
        type="radio"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 accent-gold-600"
      />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-navy-900">{title}</span>
        <span className="text-xs text-navy-700/65 mt-0.5">{desc}</span>
      </span>
    </label>
  );
}
