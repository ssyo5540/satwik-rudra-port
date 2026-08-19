"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { nav, site, socials, hero, projectStats, work } from "@/lib/content";
import { asset } from "@/lib/asset";
import CopyEmail from "@/components/ui/CopyEmail";

/** Small glyphs for the nav rows, keyed by anchor. */
const ICONS: Record<string, string> = {
  "#hero": "M3 9.5 8 5l5 4.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z",
  "#about": "M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-5 6c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5",
  "#work": "M3 5.5h10v8H3v-8Zm3.5 0V4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5",
  "#projects": "M2.5 6 8 3l5.5 3L8 9 2.5 6Zm0 4L8 13l5.5-3",
  "#capabilities": "M9 2 4 9h3l-1 5 5-7H8l1-5Z",
  "#faq": "M8 12.5h.01M6.2 6a1.8 1.8 0 1 1 2.4 1.7c-.5.2-.8.6-.8 1.1v.4",
};

function NavIcon({ href }: { href: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={ICONS[href] ?? ICONS["#hero"]}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string>("#hero");
  const [dark, setDark] = useState(false);

  /* Scroll-spy: highlight the section currently under the sidebar. */
  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive("#" + visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* Reveal after the hero, and invert over dark sections. */
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, x: -28, pointerEvents: "none" });

      // end: "max" keeps the trigger active for the whole page below the hero,
      // so `isActive` maps directly to "sidebar should be showing". A plain
      // onEnter/onLeaveBack pair does not survive the pinned sections further
      // down, which re-run refresh and can skip the crossing.
      // NOTE: pass the element, not "#hero". gsap.context(fn, root) scopes
      // selector strings to `root`, so "#hero" would be searched inside the
      // <aside> and silently resolve to nothing.
      const heroEl = document.getElementById("hero");
      if (!heroEl) return;

      ScrollTrigger.create({
        trigger: heroEl,
        start: "bottom 75%",
        end: "max",
        onToggle: (self) =>
          gsap.to(el, {
            opacity: self.isActive ? 1 : 0,
            x: self.isActive ? 0 : -28,
            pointerEvents: self.isActive ? "auto" : "none",
            duration: self.isActive ? 0.8 : 0.45,
            ease: "expo.out",
          }),
      });

      // Sections that sit on ink need the inverted card treatment.
      document
        .querySelectorAll<HTMLElement>('[data-panel="dark"]')
        .forEach((section) => {
          ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) => setDark(self.isActive),
          });
        });
    }, root);

    return () => ctx.revert();
  }, []);

  const card = dark
    ? "border-cream/12 bg-ink/70 text-cream backdrop-blur-xl"
    : "border-ink/10 bg-sand-3/80 text-ink backdrop-blur-xl";
  const muted = dark ? "text-cream/55" : "text-ink/55";

  return (
    <aside
      ref={root}
      aria-label="Site navigation"
      className="no-scrollbar fixed left-5 top-4 bottom-4 z-40 hidden w-[300px] flex-col gap-2.5 overflow-y-auto lg:flex xl:w-[330px]"
    >
      {/* Wordmark + socials */}
      <div className={`flex items-center justify-between rounded-2xl border p-3.5 ${card}`}>
        <a
          href="#hero"
          className="font-display rounded-xl bg-yellow px-3 py-1.5 text-lg leading-none text-ink"
        >
          {site.wordmark}
          <span className="align-super text-[0.55em]">®</span>
        </a>
        <div className="flex gap-1.5">
          {socials
            .filter((s) => s.label !== "Email")
            .map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={`grid h-8 w-8 place-items-center rounded-lg text-[0.6rem] font-bold transition-colors duration-300 ${
                  dark
                    ? "bg-cream/10 text-cream hover:bg-yellow hover:text-ink"
                    : "bg-ink text-cream hover:bg-yellow hover:text-ink"
                }`}
              >
                {s.label === "LinkedIn" ? "in" : "gh"}
              </a>
            ))}
        </div>
      </div>

      {/* Tagline */}
      <div className={`rounded-2xl border p-3.5 ${card}`}>
        <p className={`text-[0.82rem] leading-relaxed ${muted}`}>{hero.intro}</p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 rounded-2xl border p-3.5 ${card}`}>
        <div className="pr-3">
          <div
            className={`font-display text-2xl leading-none ${
              dark ? "text-yellow" : "text-ink"
            }`}
          >
            {projectStats.total}
          </div>
          <div className="mt-1 text-[0.7rem] font-semibold leading-tight">
            Projects
          </div>
        </div>
        <div className={`border-l pl-3 ${dark ? "border-cream/12" : "border-ink/10"}`}>
          <div
            className={`font-display text-2xl leading-none ${
              dark ? "text-yellow" : "text-ink"
            }`}
          >
            {hero.stats[0].value}
            {hero.stats[0].suffix}
          </div>
          <div className="mt-1 text-[0.7rem] font-semibold leading-tight">
            Years of
            <br />
            experience
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex shrink-0 flex-col gap-1 rounded-2xl border p-2.5 ${card}`}>
        {nav.map((item) => {
          const isActive = active === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`t-label flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.66rem] transition-colors duration-300 ${
                isActive
                  ? "bg-yellow text-ink"
                  : dark
                    ? "text-cream/70 hover:bg-cream/10 hover:text-cream"
                    : "text-ink/70 hover:bg-ink/[0.06] hover:text-ink"
              }`}
            >
              <NavIcon href={item.href} />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Where I've worked */}
      <div className={`overflow-hidden rounded-2xl border px-3.5 py-3 ${card}`}>
        <p className={`t-label mb-2 text-[0.55rem] ${muted}`}>Worked with</p>
        <div className="flex flex-wrap gap-1.5">
          {work.items.map((w) => (
            <span
              key={w.company}
              className={`rounded-md px-2 py-1 text-[0.62rem] font-semibold ${
                dark ? "bg-cream/10 text-cream/80" : "bg-ink/[0.06] text-ink/70"
              }`}
            >
              {w.company}
            </span>
          ))}
        </div>
      </div>

      {/* Email */}
      <div className={`rounded-2xl border px-3.5 py-3 ${card}`}>
        <CopyEmail email={site.email} className="text-[0.78rem]" />
      </div>

      {/* Resume */}
      <a
        href={asset(site.resume)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-yellow w-full !rounded-2xl !py-4 !text-[0.72rem]"
      >
        Resume
      </a>
      <div aria-hidden className="h-1 shrink-0" />
    </aside>
  );
}
