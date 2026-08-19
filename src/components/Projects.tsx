"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { projects } from "@/lib/content";
import { asset } from "@/lib/asset";
import { SplitLines } from "@/components/ui/Anim";

type Project = (typeof projects.items)[number];

/** Full-bleed art for a card: phone stack, browser shot, or a wordmark panel. */
function CardArt({ project }: { project: Project }) {
  const phone = project.shotStyle === "phone";

  if (!project.shots.length) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[#141410]">
        <p
          className="font-display text-cream/10"
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 0.9 }}
        >
          {project.name}
        </p>
      </div>
    );
  }

  if (phone) {
    return (
      <div className="absolute inset-0 flex items-center justify-center gap-3 overflow-hidden bg-[#141410] px-6 md:gap-5">
        {project.shots.slice(0, 3).map((src, i) => (
          <div
            key={src}
            className="relative w-[26%] shrink-0 overflow-hidden rounded-[14px] border border-cream/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
            style={{ transform: `translateY(${i === 1 ? -22 : 10}px)` }}
          >
            <Image
              src={asset(src)}
              alt=""
              width={416}
              height={900}
              sizes="(max-width: 768px) 28vw, 200px"
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
      sizes="(max-width: 768px) 90vw, 46vw"
      className="absolute inset-0 h-full w-full object-cover object-top"
    />
  );
}

function Card({ project, index }: { project: Project; index: number }) {
  const live = project.status === "Live";
  const href = project.links.find((l) => l.href)?.href;

  return (
    <article className="project-card-inner group relative h-full overflow-hidden rounded-[22px] bg-ink">
      <CardArt project={project} />

      {/* Legibility wash under the copy */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 26%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      {/* Top row: index + tags */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5 md:p-6">
        <span className="t-label rounded-full bg-ink/70 px-3 py-1.5 text-[0.58rem] text-cream/80 backdrop-blur">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ul className="flex flex-wrap justify-end gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="t-label rounded-full border border-cream/20 bg-ink/50 px-2.5 py-1.5 text-[0.55rem] text-cream/80 backdrop-blur"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom: title, blurb, meta, arrow */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`t-label rounded-full px-2.5 py-1 text-[0.55rem] ${
              project.kind === "Freelance"
                ? "bg-cream text-ink"
                : "border border-cream/30 text-cream/80"
            }`}
          >
            {project.kind}
          </span>
          <span
            className={`t-label inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.55rem] ${
              live ? "bg-yellow text-ink" : "border border-cream/30 text-cream/80"
            }`}
          >
            <span
              className={`status-dot ${live ? "text-ink" : "text-[#ffb347]"}`}
              aria-hidden
            />
            {project.status}
          </span>
          <span className="t-label text-[0.55rem] text-cream/45">{project.year}</span>
        </div>

        <div className="flex items-end justify-between gap-5">
          <div className="min-w-0">
            <h3 className="t-h3 text-[1.6rem] text-cream md:text-[2.1rem]">
              {project.name}
            </h3>
            <p className="t-body mt-2 max-w-[46ch] text-[0.9rem] text-cream/65 line-clamp-3">
              {project.body}
            </p>
          </div>

          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.name}`}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cream/25 text-cream transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-yellow hover:bg-yellow hover:text-ink"
            >
              <svg width="15" height="15" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </article>
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
      // scrolling resumes once the last card is reached.
      ScrollTrigger.create({
        trigger: stageEl,
        start: "top top",
        end: () => "+=" + (trackEl.scrollWidth - window.innerWidth),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setActive(Math.round(self.progress * (total - 1))),
        animation: gsap.to(trackEl, {
          x: () => -(trackEl.scrollWidth - window.innerWidth),
          ease: "none",
        }),
      });
    }, root);

    return () => ctx.revert();
  }, [total]);

  const nudge = (dir: 1 | -1) =>
    window.scrollBy({ top: window.innerWidth * dir, behavior: "smooth" });

  return (
    <section
      ref={root}
      id="projects"
      data-panel="dark"
      className="noise relative z-20 rounded-t-[28px] bg-ink pt-20 text-cream md:rounded-t-[44px] md:pt-28"
    >
      {/* Heading */}
      <div className="shell mb-10 md:mb-14">
        <span className="t-label mb-6 inline-block rounded-full border border-cream/25 px-4 py-2 text-[0.6rem] text-cream/80">
          {projects.eyebrow}
        </span>
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SplitLines className="t-h2 text-cream" as="h2">
              {projects.heading.join("\n")}
            </SplitLines>
          </div>
          <div className="md:col-span-5">
            <SplitLines className="t-body text-cream/60" as="p" delay={0.1}>
              {projects.intro}
            </SplitLines>
          </div>
        </div>
      </div>

      {/* Pinned horizontal rail */}
      <div ref={stage} className="relative h-[100svh] overflow-hidden">
        <div ref={track} className="flex h-full will-change-transform">
          {projects.items.map((p, i) => (
            <div
              key={p.slug}
              className="project-card flex h-full w-screen shrink-0 items-center pb-24 pt-4 md:pb-20"
            >
              <div className="shell h-full w-full">
                <div className="h-full py-2 md:py-6">
                  <Card project={p} index={i} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress + arrows */}
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
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => nudge(dir === "next" ? 1 : -1)}
                aria-label={dir === "prev" ? "Previous project" : "Next project"}
                disabled={dir === "prev" ? active === 0 : active === total - 1}
                className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 text-cream backdrop-blur transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-yellow hover:bg-yellow hover:text-ink disabled:pointer-events-none disabled:opacity-25"
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
