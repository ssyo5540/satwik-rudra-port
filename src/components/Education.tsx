"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { education } from "@/lib/content";
import { SplitLines } from "@/components/ui/Anim";

export default function Education() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Same reveal idiom as the other card grids: masked wipe up, staggered.
      gsap.fromTo(
        ".edu-card",
        { clipPath: "inset(100% 0% 0% 0%)", y: 44 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          duration: 1.25,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: ".edu-grid", start: "top 86%", once: true },
        }
      );

      gsap.from(".edu-crest", {
        scale: 0.55,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: ".edu-grid", start: "top 86%", once: true },
      });

      // Rule under each card draws in from the left.
      gsap.from(".edu-rule", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.1,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: ".edu-grid", start: "top 84%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="education"
      className="relative z-20 overflow-hidden bg-sand py-20 md:py-28"
    >
      <div className="shell">
        <div className="mb-12 grid gap-8 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="t-label mb-5 text-ink/45">{education.eyebrow}</p>
            <SplitLines className="t-h2" as="h2">
              {education.heading.join("\n")}
            </SplitLines>
          </div>
          <div className="md:col-span-5">
            <SplitLines className="t-body text-ink/65" as="p" delay={0.1}>
              {education.intro}
            </SplitLines>
          </div>
        </div>

        <div className="edu-grid grid gap-5 md:grid-cols-3">
          {education.items.map((item) => (
            <article
              key={item.slug}
              className="edu-card flex flex-col rounded-[22px] border border-ink/10 bg-sand-3 p-7 md:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span
                  className="edu-crest font-display grid h-14 w-14 shrink-0 place-items-center rounded-[15px] text-cream"
                  style={{ background: item.accent }}
                  aria-hidden
                >
                  <span className="text-[0.72rem] tracking-[0.04em]">
                    {item.monogram}
                  </span>
                </span>
                <span
                  className={`t-label inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.56rem] ${
                    item.status === "Current"
                      ? "bg-yellow text-ink"
                      : "border border-ink/25 text-ink/60"
                  }`}
                >
                  {item.status === "Current" && (
                    <span aria-hidden className="status-dot" />
                  )}
                  {item.period}
                </span>
              </div>

              <h3 className="t-h3 mb-1.5 text-[1.25rem] leading-tight md:text-[1.35rem]">
                {item.degree}
              </h3>
              <p className="t-label mb-5 text-ink/50">{item.focus}</p>

              <div className="edu-rule mb-5 h-px w-full bg-ink/12" />

              <p className="t-body mb-1 font-semibold text-ink/85">
                {item.school}
              </p>
              <p className="t-label mb-4 text-ink/45">{item.place}</p>

              <p className="t-body mt-auto text-[0.9rem] text-ink/60">
                {item.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
