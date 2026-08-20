"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { projects } from "@/lib/content";
import { asset } from "@/lib/asset";
import { SplitLines } from "@/components/ui/Anim";

type Project = (typeof projects.items)[number];

/** Card artwork: a browser shot fills the frame, phone shots sit as a stack. */
function CardArt({ project }: { project: Project }) {
  const phone = project.shotStyle === "phone";

  if (!project.shots.length) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[#1c1c17]">
        <span
          className="font-display px-6 text-center text-yellow/85"
          style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", lineHeight: 0.95 }}
        >
          {project.name}
        </span>
      </div>
    );
  }

  if (phone) {
    return (
      <div className="absolute inset-x-0 top-[9%] flex justify-center gap-2.5 px-4">
        {project.shots.slice(0, 3).map((src, i) => (
          <div
            key={src}
            className="relative w-[37%] shrink-0 overflow-hidden rounded-[10px] border border-cream/12 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.95)]"
            style={{ transform: `translateY(${i === 1 ? -22 : 10}px)` }}
          >
            <Image
              src={asset(src)}
              alt=""
              width={460}
              height={1000}
              sizes="190px"
              className="h-auto w-full"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Image
      src={asset(project.shots[0])}
      alt=""
      width={1400}
      height={875}
      sizes="(max-width: 768px) 80vw, 440px"
      className="absolute inset-0 h-full w-full object-cover object-top"
    />
  );
}

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = projects.items.length;

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    const stageEl = stage.current;
    const trackEl = track.current;
    if (!el || !stageEl || !trackEl || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Pin the stage and turn vertical scroll into horizontal travel. The
      // distance equals the track's overflow, so the mapping is 1:1 and normal
      // scrolling resumes once the last card clears.
      const st = ScrollTrigger.create({
        trigger: stageEl,
        start: "top top",
        end: () => "+=" + (trackEl.scrollWidth - window.innerWidth),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          setActive(Math.round(self.progress * (total - 1))),
        animation: gsap.to(trackEl, {
          x: () => -(trackEl.scrollWidth - window.innerWidth),
          ease: "none",
        }),
      });
      return () => st.kill();
    }, root);

    return () => ctx.revert();
  }, [total]);

  const nudge = (dir: 1 | -1) =>
    window.scrollBy({ top: window.innerWidth * 0.5 * dir, behavior: "smooth" });

  return (
    <section
      ref={root}
      id="projects"
      className="relative z-20 bg-ink pt-20 text-cream md:pt-28"
    >
      <div className="shell">
        <div className="mb-10 grid gap-8 md:mb-14 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="t-label mb-6 inline-block rounded-full border border-cream/25 px-4 py-2 text-[0.58rem] text-cream/70">
              {projects.eyebrow}
            </span>
            <SplitLines className="t-h2 text-cream" as="h2">
              {projects.heading.join("\n")}
            </SplitLines>
          </div>
          <div className="md:col-span-5">
            <SplitLines className="t-body text-cream/55" as="p" delay={0.1}>
              {projects.intro}
            </SplitLines>
          </div>
        </div>
      </div>

      {/* Pinned stage */}
      <div ref={stage} className="relative h-[100svh] overflow-hidden">
        <div ref={track} className="flex h-full items-center pb-24 will-change-transform md:pb-16">
          {/* Lead-in space so the first card sits near the middle of the
              viewport and the rest are clearly still to come. */}
          <div aria-hidden className="h-full w-[30vw] shrink-0 md:w-[50vw]" />

          {projects.items.map((p, i) => (
            <article
              key={p.slug}
              className="project-card group relative mr-5 flex h-[84vh] w-[80vw] shrink-0 flex-col overflow-hidden rounded-[24px] bg-[#1c1c17] sm:h-[78vh] sm:w-[56vw] md:mr-6 md:h-[76vh] md:w-[42vw] lg:w-[33vw] xl:w-[30vw]"
            >
              <CardArt project={p} />

              {/* Top scrim so the index and tags stay readable over artwork */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-32"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
                }}
              />

              {/* Index */}
              <span className="t-label absolute left-5 top-5 z-10 rounded-full bg-black/45 px-3 py-1.5 text-[0.58rem] text-cream/85 backdrop-blur-sm">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Tags */}
              <ul className="absolute right-4 top-5 z-10 flex max-w-[62%] flex-wrap justify-end gap-1.5">
                {p.tags.slice(0, 3).map((tag, ti) => (
                  <li
                    key={tag}
                    // third tag only where the card is wide enough for one row
                    className={`t-label rounded-full bg-black/40 px-2.5 py-1 text-[0.52rem] text-cream/80 backdrop-blur-sm ${
                      ti === 2 ? "hidden lg:list-item" : ""
                    }`}
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              {/* Artwork breathing room: the card art sits behind this spacer. */}
              <div aria-hidden className="min-h-[12%] flex-1 sm:min-h-[20%]" />

              {/* Copy: normal flow, so the full description always fits. */}
              <div
                className="relative z-10 p-5 sm:p-6 md:p-7"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.94) 55%, rgba(0,0,0,0.78) 85%, rgba(0,0,0,0) 100%)",
                }}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`t-label rounded-full px-2.5 py-1 text-[0.52rem] ${
                      p.kind === "Freelance"
                        ? "bg-cream text-ink"
                        : "border border-cream/35 text-cream/80"
                    }`}
                  >
                    {p.kind}
                  </span>
                  <span
                    className={`t-label inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.52rem] ${
                      p.status === "Live"
                        ? "bg-yellow text-ink"
                        : "border border-cream/35 text-cream/70"
                    }`}
                  >
                    {p.status === "Live" && (
                      <span aria-hidden className="status-dot" />
                    )}
                    {p.status}
                  </span>
                  <span className="t-label text-[0.52rem] text-cream/45">
                    {p.year}
                  </span>
                </div>

                <h3 className="t-h3 mb-2 text-[1.3rem] leading-tight text-cream sm:text-[1.5rem] md:text-[1.7rem]">
                  {p.name}
                </h3>
                <p className="t-body mb-4 text-[0.78rem] leading-relaxed text-cream/65 sm:mb-5 sm:text-[0.86rem]">
                  {p.body}
                </p>

                <div className="flex items-end justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {p.links
                      .filter((l) => l.href)
                      .map((l) => (
                        <a
                          key={l.label}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="t-label rounded-full bg-cream px-3.5 py-2 text-[0.55rem] text-ink transition-colors duration-300 hover:bg-yellow"
                        >
                          {l.label}
                        </a>
                      ))}
                  </div>
                  <span
                    aria-hidden
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-cream/30 text-cream transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-cream group-hover:bg-cream group-hover:text-ink"
                  >
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          ))}

          {/* Trailing space so the last card can settle clear of the edge. */}
          <div aria-hidden className="h-full w-[14vw] shrink-0" />
        </div>

        {/* Progress + controls */}
        <div className="shell pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-between gap-4 md:bottom-8">
          <div className="flex items-center gap-1.5" aria-hidden>
            {projects.items.map((p, i) => (
              <span
                key={p.slug}
                className={`h-[3px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  i === active ? "w-8 bg-yellow" : "w-3 bg-cream/25"
                }`}
              />
            ))}
          </div>
          <div className="pointer-events-auto flex items-center gap-2.5">
            <span className="t-label mr-1 hidden text-cream/40 sm:block">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => nudge(dir === "next" ? 1 : -1)}
                aria-label={dir === "prev" ? "Previous project" : "Next project"}
                disabled={dir === "prev" ? active === 0 : active === total - 1}
                className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 text-cream transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cream hover:bg-cream hover:text-ink disabled:pointer-events-none disabled:opacity-25"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d={dir === "prev" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-20 md:h-28" />
    </section>
  );
}
