import { useEffect } from "react";
import { SmartLink } from "../components/SmartLink";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "QPort | Page Not Found";
  }, []);

  return (
    <main className="bg-[var(--bg)] py-24">
      <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-[var(--text)] md:text-5xl">
          Page not found.
        </h1>
        <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-[var(--muted)] md:text-base" data-cursor="text">
          The URL is valid, but this route does not exist in the marketing site.
        </p>
        <div className="mt-8">
          <SmartLink
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--brand-bright)] px-6 py-3 font-semibold tracking-[-0.01em] text-white shadow-lift hover:bg-[#0f3bd4]"
          >
            Back to home
          </SmartLink>
        </div>
      </div>
    </main>
  );
}
