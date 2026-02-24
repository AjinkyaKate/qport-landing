import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";

function FaqItem({ q, a, open, onToggle }) {
  const bodyRef = useRef(null);

  const maxH = open ? `${bodyRef.current?.scrollHeight || 0}px` : "0px";

  return (
    <div className="rounded-2xl border border-[rgba(16,24,40,0.08)] bg-white shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-base font-semibold tracking-[-0.02em] text-[var(--text)]">
          {q}
        </span>
        <span
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(16,24,40,0.10)] bg-[#f9fafb] transition-transform duration-200 ease-out",
            open ? "rotate-45" : "rotate-0",
          ].join(" ")}
          aria-hidden="true"
        >
          <Plus size={18} className="text-[var(--muted)]" />
        </span>
      </button>

      <div
        className="overflow-hidden px-5 transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: maxH }}
      >
        <div ref={bodyRef} className="pb-5 text-sm leading-relaxed text-[var(--muted)]" data-cursor="text">
          {a}
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const items = useMemo(
    () => [
      {
        q: "How does QPort handle multi-week trips and truck swaps?",
        a: "Routes are treated as an operational asset. The route stays tied to the run and the truck context, so handoffs don’t fragment the truth.",
      },
      {
        q: "Can we attach photo, video, voice, and text to a specific location?",
        a: "Yes. Annotations are captured as location-based records. Drivers see them at the right moment, not buried in a report.",
      },
      {
        q: "Can we reuse parts of a surveyed route?",
        a: "Yes. Split routes into segments, merge segments into a continuous run, and keep lineage so you can trust where each segment came from.",
      },
      {
        q: "How do we share route information with clients and stakeholders?",
        a: "Exports are designed for operations: route map, annotation details, and media evidence in PPTX/PDF formats that match the field reality.",
      },
      {
        q: "What happens when connectivity drops during a survey?",
        a: "Survey capture is designed to keep moving. The system syncs when connectivity returns so the route stays consistent.",
      },
      {
        q: "What does onboarding look like for a new carrier?",
        a: "Start with a demo, run a pilot corridor, then standardize roles, exports, and the route library so teams operate from one playbook.",
      },
    ],
    []
  );

  const [open, setOpen] = useState(-1);

  return (
    <section id="faq" className="bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto w-[min(1100px,100%)] px-6 md:px-16">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--muted)]">FAQ</p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] md:text-4xl">
              The objections that matter.
            </h3>
          </div>
          <p className="max-w-[520px] text-sm leading-relaxed text-[var(--muted)] md:text-base" data-cursor="text">
            If you’re evaluating QPort, you’re not looking for features. You’re looking for failure modes.
          </p>
        </div>

        <div className="mt-10 grid gap-4">
          {items.map((it, idx) => (
            <FaqItem
              key={it.q}
              q={it.q}
              a={it.a}
              open={open === idx}
              onToggle={() => setOpen((cur) => (cur === idx ? -1 : idx))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
