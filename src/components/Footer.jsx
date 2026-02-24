export function Footer({ links }) {
  const year = new Date().getFullYear();

  const product = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#process" },
    { label: "Exports", href: "#demo" },
    { label: "FAQ", href: "#faq" },
  ];

  const modules = [
    { label: "Routes", href: "#features" },
    { label: "Tasks", href: "#features" },
    { label: "Analytics", href: "#features" },
    { label: "QPort AI", href: "#features" },
  ];

  return (
    <footer className="bg-[#0b1220] text-white">
      <div className="rounded-t-[3.5rem] border-t border-white/10 bg-[#0b1220]">
        <div className="mx-auto w-[min(1100px,100%)] px-6 py-14 md:px-16">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="font-display text-2xl font-semibold tracking-[-0.03em]">QPort</div>
              <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-white/65" data-cursor="text">
                Route management for wind ODC transport. Survey once. Dispatch with the same truth.
              </p>

              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="font-mono text-xs tracking-[0.18em] text-white/75">
                  SYSTEM OPERATIONAL
                </span>
              </div>
            </div>

            <div className="grid gap-8 md:col-span-5 md:grid-cols-2">
              <div>
                <div className="font-mono text-xs tracking-[0.22em] text-white/45">PRODUCT</div>
                <ul className="mt-4 space-y-3">
                  {product.map((l) => (
                    <li key={l.href}>
                      <a className="text-sm text-white/70 hover:text-white" href={l.href}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono text-xs tracking-[0.22em] text-white/45">MODULES</div>
                <ul className="mt-4 space-y-3">
                  {modules.map((l) => (
                    <li key={l.href}>
                      <a className="text-sm text-white/70 hover:text-white" href={l.href}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="font-mono text-xs tracking-[0.22em] text-white/45">NAV</div>
              <ul className="mt-4 space-y-3">
                {(links || []).map((l) => (
                  <li key={l.href}>
                    <a className="text-sm text-white/70 hover:text-white" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-8 font-mono text-xs text-white/45">
                © {year} QPort. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

