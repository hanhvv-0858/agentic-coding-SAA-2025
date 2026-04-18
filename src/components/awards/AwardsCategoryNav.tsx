"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AwardSlug } from "@/data/awards";

type AwardsCategoryNavProps = {
  items: ReadonlyArray<{ slug: AwardSlug; label: string }>;
  ariaLabel: string;
  initialActiveSlug: AwardSlug;
};

const SCROLLEND_FALLBACK_MS = 600;

/**
 * Sticky left-column category nav with IntersectionObserver scroll-spy +
 * smooth-scroll on click + URL hash update via `history.replaceState` +
 * keyboard support + reduced-motion + JS-disabled fallbacks.
 *
 * Items render as `<a href="#<slug>">` so browsers without JS still scroll
 * natively via anchor behaviour.
 */
export function AwardsCategoryNav({ items, ariaLabel, initialActiveSlug }: AwardsCategoryNavProps) {
  const [activeSlug, setActiveSlug] = useState<AwardSlug>(initialActiveSlug);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isProgrammaticScrolling = useRef(false);
  const pauseTimer = useRef<number | null>(null);

  // Pauses scroll-spy updates until a programmatic smooth-scroll finishes.
  // Listens for `scrollend` (Safari 16.4+, Chrome/Firefox recent) and falls
  // back to a 600 ms timeout when unsupported.
  const schedulePauseRelease = useCallback(() => {
    if (pauseTimer.current !== null) {
      window.clearTimeout(pauseTimer.current);
      pauseTimer.current = null;
    }

    const release = () => {
      isProgrammaticScrolling.current = false;
      pauseTimer.current = null;
    };

    const hasScrollend = "onscrollend" in window;
    if (hasScrollend) {
      const onScrollEnd = () => {
        release();
        (window as Window).removeEventListener(
          "scrollend" as keyof WindowEventMap,
          onScrollEnd,
        );
      };
      (window as Window).addEventListener(
        "scrollend" as keyof WindowEventMap,
        onScrollEnd,
        { once: true },
      );
      pauseTimer.current = window.setTimeout(() => {
        (window as Window).removeEventListener(
          "scrollend" as keyof WindowEventMap,
          onScrollEnd,
        );
        release();
      }, SCROLLEND_FALLBACK_MS);
    } else {
      pauseTimer.current = window.setTimeout(release, SCROLLEND_FALLBACK_MS);
    }
  }, []);

  // Detect prefers-reduced-motion (and keep in sync with OS changes).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Initial hash-scroll on mount + listen for hashchange (browser back/forward).
  useEffect(() => {
    const validSlugs = new Set(items.map((i) => i.slug));

    const scrollToHashSlug = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw || !validSlugs.has(raw as AwardSlug)) return;
      const el = document.getElementById(raw);
      if (!el) return;
      isProgrammaticScrolling.current = true;
      setActiveSlug(raw as AwardSlug);
      requestAnimationFrame(() => {
        el.scrollIntoView({
          behavior: reducedMotion ? "instant" : "smooth",
          block: "start",
        });
        schedulePauseRelease();
      });
    };

    scrollToHashSlug();
    window.addEventListener("hashchange", scrollToHashSlug);
    return () => window.removeEventListener("hashchange", scrollToHashSlug);
  }, [items, reducedMotion, schedulePauseRelease]);

  // IntersectionObserver scroll-spy.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrolling.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const slug = entry.target.id as AwardSlug;
            setActiveSlug(slug);
            break;
          }
        }
      },
      { rootMargin: "-40% 0px -60% 0px", threshold: 0 },
    );

    for (const { slug } of items) {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  const navigateTo = useCallback(
    (slug: AwardSlug) => {
      const el = document.getElementById(slug);
      if (!el) return;
      isProgrammaticScrolling.current = true;
      setActiveSlug(slug);
      history.replaceState(null, "", `#${slug}`);
      el.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "start",
      });
      schedulePauseRelease();
    },
    [reducedMotion, schedulePauseRelease],
  );

  return (
    <nav
      aria-label={ariaLabel}
      className="sticky top-[120px] hidden w-[220px] shrink-0 self-start lg:block"
    >
      <ul className="flex flex-col gap-6">
        {items.map(({ slug, label }) => {
          const isActive = slug === activeSlug;
          return (
            <li key={slug}>
              <a
                href={`#${slug}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(slug);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateTo(slug);
                  }
                }}
                className={[
                  "group relative flex items-center gap-2 rounded px-2 py-1.5",
                  "font-[family-name:var(--font-montserrat)] text-sm leading-5 font-bold tracking-[0.1px]",
                  "transition-[background-color,transform,color] duration-150 ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2",
                  "hover:bg-[var(--color-accent-cream)]/10 motion-safe:hover:translate-x-[2px]",
                  isActive
                    ? "text-[var(--color-accent-cream)]"
                    : "text-white",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "inline-block h-2 w-2 rounded-full transition-opacity",
                    isActive ? "bg-[var(--color-nav-dot)] opacity-100" : "opacity-0",
                  ].join(" ")}
                />
                <span
                  className={[
                    "relative pb-0.5 transition-[border-color]",
                    isActive
                      ? "border-b border-[var(--color-accent-cream)]"
                      : "border-b border-transparent",
                  ].join(" ")}
                >
                  {label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
