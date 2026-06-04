type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

export default function PageShell({ eyebrow, title, subtitle, children, actions }: Props) {
  return (
    <div className="bg-cream min-h-[calc(100vh-5rem)]">
      <div className="bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14">
          {eyebrow ? (
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-500 font-semibold">
              {eyebrow}
            </div>
          ) : null}
          <div className="mt-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
              {subtitle ? (
                <p className="mt-2 text-white/65 max-w-2xl text-sm md:text-base leading-relaxed">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-14">{children}</div>
    </div>
  );
}
