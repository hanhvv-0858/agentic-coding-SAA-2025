"use client";

// §B.7 SpotlightBoard — 1157×548 wooden-backdrop word-cloud of Sunners
// who've received a kudo. Pan/zoom via the hand-rolled `usePanZoom`
// hook (Q9 default). Server-precomputed `x/y/weight` coords (TR-012)
// mean the client only renders; no layout work per tick.
//
// Inlines the 3 sub-pieces per plan §Project Structure:
//   - `SpotlightCounter`       (B.7.1)
//   - `SpotlightPanZoomControls` (B.7.2)
//   - `SpotlightSearch`        (B.7.3)
//
// Mobile (< 640 px) falls back to a vertical top-20 list sorted by
// `weight` desc (Q7 / OQ-DS-8 default).

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/libs/analytics/track";
import { SpotlightCounter } from "./SpotlightCounter";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { usePanZoom, type PanZoomState } from "./hooks/usePanZoom";
import type { Messages } from "@/libs/i18n/getMessages";
import type { SpotlightLatestKudo, SpotlightRecipient } from "@/types/kudo";

type SpotlightBoardProps = {
  recipients: SpotlightRecipient[];
  total: number;
  latestKudos?: SpotlightLatestKudo[];
  messages: Messages;
};

// Board render dimensions. Design-style §B.7: 1157×548 at desktop;
// the CSS container clamps width so the canvas scales smoothly.
const BOARD_W = 1157;
const BOARD_H = 548;

// Font-size range — weight is mapped linearly into this interval. The
// smallest recipient is 8 px (still legible at scale 0.5), the largest
// 24 px. Tightened from the initial 14–48 after user feedback
// (2026-04-23) that the top-end felt too large against the 1157×548
// canvas; the 8–24 band keeps visual hierarchy without shouting.
const FONT_MIN = 8;
const FONT_MAX = 24;

// VN-pinned formatter for the bottom-left recent-update log. Matches
// the pattern used in `src/libs/kudos/formatKudoTimestamp.ts` to avoid
// server/client timezone mismatches during hydration.
const RECENT_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/**
 * Compact helper — returns a number in `[FONT_MIN, FONT_MAX]` based on
 * a normalised weight.
 */
function weightToFont(weight: number, min: number, max: number): number {
  if (max === min) return FONT_MIN;
  const t = (weight - min) / (max - min);
  return FONT_MIN + t * (FONT_MAX - FONT_MIN);
}

// Spacing guard-rail between neighbouring names in px (on top of each
// name's own bounding box). Tuned against the 1157×548 board.
const NAME_PADDING = 12;
const RELAX_ITERATIONS = 120;

// Pull server-provided `(x, y)` seeds toward the board centre before
// relaxation. The server uniformly hashes positions into `[0.06, 0.94]`
// (≈ 88 % of canvas), which makes the cloud fan to the corners with
// large swaths of empty space between names. Scaling deltas-from-centre
// by 0.7 collapses seeds into the inner ~62 % of the panel so names
// cluster visually; the relaxation pass still resolves any overlaps,
// and the final clamp keeps everyone inside the frame (no clipping).
const SEED_SPREAD = 0.7;

type LaidOutName = {
  name: string;
  weight: number;
  font: number;
  x: number; // 0..1 normalised
  y: number; // 0..1 normalised
};

/**
 * Collision-avoidance relaxation. Each recipient starts at its
 * server-provided `(x, y)` (hint/seed) and is then pushed away from
 * any neighbour it overlaps with — along the axis of smallest overlap
 * — for up to `RELAX_ITERATIONS` passes. Keeps the cloud roughly at
 * its original distribution while guaranteeing names don't stack on
 * each other. Pure function — safe inside `useMemo`.
 */
function relaxPositions(
  items: Array<{ name: string; weight: number; x: number; y: number }>,
  minW: number,
  maxW: number,
): LaidOutName[] {
  // Approximate each rendered name's half-extent in px. Montserrat Bold
  // at size `s` averages ~0.55·s per character; height ≈ 1.3·s. We use
  // a half-extent (to the centre) because positions anchor at
  // `translate(-50%, -50%)`.
  const boxes = items.map((it) => {
    const font = weightToFont(it.weight, minW, maxW);
    // Slightly wider multiplier (0.6 vs. Montserrat's ~0.55 avg) so the
    // edge clamp reserves a safer margin for wide glyph runs — prevents
    // the "Hung V…" clipping seen at the right edge of the panel.
    const halfW = Math.max(20, (it.name.length * font * 0.6) / 2);
    const halfH = (font * 1.3) / 2;
    // Pull seed toward board centre via SEED_SPREAD so the cloud
    // clusters instead of fanning to the corners. `it.{x,y}` are in
    // [0.06, 0.94]; after this transform they live in the inner ~62 %
    // of the panel.
    const seedX = 0.5 + (it.x - 0.5) * SEED_SPREAD;
    const seedY = 0.5 + (it.y - 0.5) * SEED_SPREAD;
    return {
      name: it.name,
      weight: it.weight,
      font,
      halfW,
      halfH,
      x: seedX * BOARD_W,
      y: seedY * BOARD_H,
    };
  });

  for (let iter = 0; iter < RELAX_ITERATIONS; iter++) {
    let moved = false;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const overlapX = a.halfW + b.halfW + NAME_PADDING - Math.abs(dx);
        const overlapY = a.halfH + b.halfH + NAME_PADDING - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) continue;
        // Push along the axis with the smallest remaining overlap so
        // the nudge is minimal + visually stable across re-runs.
        if (overlapX < overlapY) {
          const push = overlapX / 2 + 0.5;
          if (dx === 0) {
            a.x += push;
            b.x -= push;
          } else if (dx > 0) {
            a.x += push;
            b.x -= push;
          } else {
            a.x -= push;
            b.x += push;
          }
        } else {
          const push = overlapY / 2 + 0.5;
          if (dy === 0) {
            a.y += push;
            b.y -= push;
          } else if (dy > 0) {
            a.y += push;
            b.y -= push;
          } else {
            a.y -= push;
            b.y += push;
          }
        }
        moved = true;
      }
    }
    // Clamp inside the board.
    for (const box of boxes) {
      box.x = Math.max(box.halfW + 4, Math.min(BOARD_W - box.halfW - 4, box.x));
      box.y = Math.max(box.halfH + 4, Math.min(BOARD_H - box.halfH - 4, box.y));
    }
    if (!moved) break;
  }

  return boxes.map((b) => ({
    name: b.name,
    weight: b.weight,
    font: b.font,
    x: b.x / BOARD_W,
    y: b.y / BOARD_H,
  }));
}

export function SpotlightBoard({
  recipients,
  total,
  latestKudos = [],
  messages,
}: SpotlightBoardProps) {
  const [search, setSearch] = useState("");
  const reducedMotion = useReducedMotion();

  // Roving-tabindex focus index (Q8). -1 = nothing focused yet; first
  // keyboard entry into the listbox snaps to 0 (highest-weight name).
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const nameRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const panStartedRef = useRef(false);
  const emitPanEvent = useDebouncedCallback(
    (next: PanZoomState) => {
      track({
        type: "kudos_spotlight_pan",
        delta_x: Math.round(next.x),
        delta_y: Math.round(next.y),
      });
    },
    500,
  );

  const { state, actions, handlers, isPanning } = usePanZoom({
    minScale: 0.5,
    maxScale: 3,
    onPanStart: () => {
      if (!panStartedRef.current) {
        panStartedRef.current = true;
      }
    },
    onInteractionEnd: (next) => {
      emitPanEvent(next);
    },
  });

  // Reset the "panned once" flag when recipients change (e.g. route
  // swap) so analytics throttle holds per session.
  useEffect(() => {
    panStartedRef.current = false;
  }, [recipients]);

  const { minWeight, maxWeight } = useMemo(() => {
    if (recipients.length === 0) {
      return { minWeight: 0, maxWeight: 0 };
    }
    let lo = Infinity;
    let hi = -Infinity;
    for (const r of recipients) {
      if (r.weight < lo) lo = r.weight;
      if (r.weight > hi) hi = r.weight;
    }
    return { minWeight: lo, maxWeight: hi };
  }, [recipients]);

  // Run collision-avoidance over the server/mock positions so names
  // never sit on top of each other in the rendered cloud.
  const laidOut = useMemo(
    () => relaxPositions(recipients, minWeight, maxWeight),
    [recipients, minWeight, maxWeight],
  );

  // Filter + sort for mobile fallback + search highlight.
  const normalisedSearch = search.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!normalisedSearch) return new Set<string>();
    return new Set(
      recipients
        .filter((r) => r.name.toLowerCase().includes(normalisedSearch))
        .map((r) => r.name),
    );
  }, [recipients, normalisedSearch]);

  const sorted = useMemo(
    () => [...recipients].sort((a, b) => b.weight - a.weight),
    [recipients],
  );
  const top20 = useMemo(() => sorted.slice(0, 20), [sorted]);

  // Format "2026-04-19T01:09:56.563+00:00" → "08:09AM" (Asia/Ho_Chi_Minh).
  // ALWAYS rendered in VN time so SSR (UTC runtime on Cloudflare
  // Workers) and CSR (user's local timezone) produce the identical
  // string — otherwise `d.getHours()` / `d.getMinutes()` cause
  // hydration mismatches (same class of bug as `formatKudoTimestamp`).
  // Non-ISO inputs pass through unchanged (e.g. legacy "08:30PM" strings).
  const formatRecentTime = (raw: string): string => {
    if (!raw) return "";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    const parts = RECENT_TIME_FORMATTER.formatToParts(d);
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";
    const hour12 = pick("hour");
    const minute = pick("minute");
    const dayPeriod = pick("dayPeriod").toUpperCase();
    return `${hour12.padStart(2, "0")}:${minute}${dayPeriod}`;
  };

  // `latestKudos` comes from the server pre-sorted by `kudos.created_at
  // DESC` (spec §B.7 live activity feed — 4 most recent kudos globally,
  // may contain the same recipient twice). We just format the timestamp
  // here and pass through the server-chosen order.
  const recentUpdates = useMemo(
    () =>
      latestKudos.map((k) => ({
        name: k.recipientName,
        time: formatRecentTime(k.time) || k.time || "08:30PM",
      })),
    [latestKudos],
  );

  const onSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const onZoomIn = useCallback(
    () => actions.zoomTo(state.scale * 1.2),
    [actions, state.scale],
  );
  const onZoomOut = useCallback(
    () => actions.zoomTo(state.scale / 1.2),
    [actions, state.scale],
  );
  const onReset = useCallback(() => actions.reset(), [actions]);

  if (recipients.length === 0) {
    return (
      <div
        role="status"
        className="flex h-64 items-center justify-center rounded-[47px] bg-[var(--color-panel-surface)] text-white/70"
        data-testid="kudos-spotlight-empty"
      >
        <p>{messages.kudos.empty.spotlightEmpty}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop + tablet (>= 640 px) — pan/zoom word cloud. */}
      <div
        data-testid="kudos-spotlight-board"
        className="relative hidden h-[548px] w-full max-w-[1157px] overflow-hidden rounded-[47px] border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] sm:block"
        style={{ touchAction: "none" }}
      >
        {/* Static backdrop — constellation grid (base) + coloured roots
            (overlay). Roots use `mix-blend-mode: screen` so their solid
            dark fill becomes transparent and only the colourful strands
            layer on top of the constellation. Both sit below the
            pan/zoom canvas and do NOT transform with it. */}
        <Image
          src="/images/kudos/kudo_spotlight_bg@2x.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1157px"
          className="pointer-events-none select-none object-cover opacity-90"
          data-testid="kudos-spotlight-bg-constellation"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[var(--color-brand-900)]/30"
          data-testid="kudos-spotlight-bg-vignette"
        />
        <Image
          src="/images/kudos/kudo_root-further_bg@2x.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 1200px) 100vw, 1157px"
          className="pointer-events-none select-none object-cover mix-blend-screen"
          data-testid="kudos-spotlight-bg-roots"
        />

        {/* Pan/zoom surface — the inner layer translates + scales.
            Promoted to `role="listbox"` with roving tabindex per Q8 —
            the whole board is a single tabstop; Arrow keys move focus
            between name nodes using 2-D nearest-neighbour against the
            laid-out normalised coords. */}
        <div
          role="listbox"
          aria-label={messages.kudos.spotlight.sectionTitle}
          tabIndex={focusedIndex === -1 ? 0 : -1}
          onFocus={() => {
            if (focusedIndex === -1 && laidOut.length > 0) {
              setFocusedIndex(0);
              nameRefs.current[0]?.focus();
            }
          }}
          className="absolute inset-0 cursor-grab outline-none focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--color-accent-cream)]"
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
          {...handlers}
          onKeyDown={(e) => {
            // Roving tabindex first (Q8). Claim Home/End/Arrow keys
            // here; pan-zoom's own onKeyDown (via `handlers`) still
            // receives `+` / `-` for zoom because we only preventDefault
            // on the claimed keys.
            if (laidOut.length === 0) {
              handlers.onKeyDown(e);
              return;
            }
            if (e.key === "Home") {
              e.preventDefault();
              setFocusedIndex(0);
              nameRefs.current[0]?.focus();
              return;
            }
            if (e.key === "End") {
              e.preventDefault();
              const last = laidOut.length - 1;
              setFocusedIndex(last);
              nameRefs.current[last]?.focus();
              return;
            }
            const dir = (() => {
              switch (e.key) {
                case "ArrowLeft":
                  return { dx: -1, dy: 0 };
                case "ArrowRight":
                  return { dx: 1, dy: 0 };
                case "ArrowUp":
                  return { dx: 0, dy: -1 };
                case "ArrowDown":
                  return { dx: 0, dy: 1 };
                default:
                  return null;
              }
            })();
            if (!dir) {
              // Not an arrow / Home / End — delegate to pan-zoom (handles zoom shortcuts).
              handlers.onKeyDown(e);
              return;
            }
            e.preventDefault();
            const currentIdx = focusedIndex === -1 ? 0 : focusedIndex;
            const current = laidOut[currentIdx];
            if (!current) return;
            // 2-D nearest neighbour in the same half-plane of `dir`.
            // Score = primary-axis distance + 0.5 * cross-axis distance
            // so we prefer straight-line neighbours but fall back to
            // diagonals when the row/column is sparse.
            let bestIdx = currentIdx;
            let bestScore = Infinity;
            for (let i = 0; i < laidOut.length; i++) {
              if (i === currentIdx) continue;
              const other = laidOut[i];
              const dxNorm = other.x - current.x;
              const dyNorm = other.y - current.y;
              if (dir.dx !== 0 && Math.sign(dxNorm) !== dir.dx) continue;
              if (dir.dy !== 0 && Math.sign(dyNorm) !== dir.dy) continue;
              const primary = dir.dx !== 0 ? Math.abs(dxNorm) : Math.abs(dyNorm);
              const cross = dir.dx !== 0 ? Math.abs(dyNorm) : Math.abs(dxNorm);
              const score = primary + cross * 0.5;
              if (score < bestScore) {
                bestScore = score;
                bestIdx = i;
              }
            }
            if (bestIdx !== currentIdx) {
              setFocusedIndex(bestIdx);
              nameRefs.current[bestIdx]?.focus();
            }
          }}
          data-panning={isPanning ? "true" : "false"}
          data-testid="kudos-spotlight-canvas"
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`,
              transformOrigin: "0 0",
              transition: reducedMotion ? "none" : undefined,
              willChange: isPanning ? "transform" : undefined,
            }}
          >
            {laidOut.map((r, i) => {
              const isMatch = !normalisedSearch || matches.has(r.name);
              return (
                <button
                  key={r.name}
                  ref={(el) => {
                    nameRefs.current[i] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={focusedIndex === i}
                  tabIndex={focusedIndex === i ? 0 : -1}
                  onFocus={() => {
                    if (focusedIndex !== i) setFocusedIndex(i);
                  }}
                  className="absolute whitespace-nowrap rounded px-1 font-[family-name:var(--font-montserrat)] font-bold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
                  style={{
                    left: `${r.x * BOARD_W}px`,
                    top: `${r.y * BOARD_H}px`,
                    fontSize: `${r.font}px`,
                    opacity: isMatch ? 1 : 0.25,
                    transform: `translate(-50%, -50%)${isMatch && normalisedSearch ? " scale(1.1)" : ""}`,
                  }}
                  aria-label={`${r.name}, ${r.weight} Kudos`}
                  data-testid="kudos-spotlight-name"
                  data-name={r.name}
                  data-match={isMatch ? "true" : "false"}
                >
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* B.7.1 SpotlightCounter — live total "X KUDOS", top-center
            (design §B.7 — big prominent header). Pulses briefly when
            `total` changes after the 60 s auto-refresh (Option A live
            feedback). */}
        <SpotlightCounter
          total={total}
          suffix={messages.kudos.spotlight.counterSuffix}
          className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-[36px] font-bold leading-[44px] text-white"
          testId="kudos-spotlight-counter"
        />

        {/* B.7.3 SpotlightSearch — filter names, top-left (design §B.7). */}
        <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-[var(--color-border-secondary)] bg-[var(--color-brand-900)]/70 px-3 py-2 text-white">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={search}
            onChange={onSearchChange}
            placeholder={messages.kudos.spotlight.searchPlaceholder}
            aria-label={messages.kudos.spotlight.searchPlaceholder}
            className="w-40 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
            data-testid="kudos-spotlight-search"
          />
        </div>

        {/* B.7 Recent update log — bottom-left stack of up to 6 most
            recent kudos. Design (2026-04-23) calls for NEWEST at the
            bottom with older rows fading upward — so the feed reads
            like a fresh receipt printing out of a machine. We render
            oldest first (DOM top = faded) and newest last (DOM bottom
            = fully opaque). Opacity is `0.18 + 0.82·(i/max)` so even
            the dimmest row stays readable. */}
        {recentUpdates.length > 0 ? (
          <ul
            aria-live="polite"
            data-testid="kudos-spotlight-recent"
            className="pointer-events-none absolute bottom-6 left-6 flex flex-col gap-1 font-[family-name:var(--font-montserrat)] text-xs font-bold leading-5 text-white"
          >
            {[...recentUpdates]
              .reverse()
              .map((u, i, arr) => {
                const t = arr.length <= 1 ? 1 : i / (arr.length - 1);
                const opacity = 0.18 + 0.82 * t;
                return (
                  <li
                    key={`${u.name}-${i}`}
                    style={{ opacity }}
                    className="whitespace-nowrap"
                  >
                    <span className="text-[var(--color-accent-cream)]">{u.time}</span>
                    {" "}
                    {messages.kudos.spotlight.recentUpdateTemplate
                      .replace("{time}", "")
                      .replace("{name}", u.name)
                      .trim()}
                  </li>
                );
              })}
          </ul>
        ) : null}

        {/* B.7.2 SpotlightPanZoomControls — +, −, reset buttons. */}
        <div
          className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full border border-[var(--color-border-secondary)] bg-[var(--color-brand-900)]/70 p-1 text-white"
          data-testid="kudos-spotlight-controls"
        >
          <button
            type="button"
            onClick={onZoomIn}
            aria-label={messages.kudos.spotlight.zoomInLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
            data-testid="kudos-spotlight-zoom-in"
          >
            +
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            aria-label={messages.kudos.spotlight.zoomOutLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
            data-testid="kudos-spotlight-zoom-out"
          >
            −
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label={messages.kudos.spotlight.panLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
            data-testid="kudos-spotlight-reset"
          >
            ⟳
          </button>
        </div>
      </div>

      {/* Mobile (< 640 px) — vertical top-20 list per Q7/OQ-DS-8. */}
      <div
        className="flex flex-col gap-3 rounded-[24px] border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-4 sm:hidden"
        data-testid="kudos-spotlight-mobile-list"
      >
        <SpotlightCounter
          total={total}
          suffix={messages.kudos.spotlight.counterSuffix}
          className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent-cream)]"
        />
        <ol role="list" className="flex flex-col gap-2">
          {top20.map((r, i) => (
            <li
              key={r.name}
              className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-white"
              data-testid="kudos-spotlight-mobile-item"
            >
              <span className="text-sm font-medium">
                {i + 1}. {r.name}
              </span>
              <span className="text-xs text-white/70">
                {r.weight} Kudos
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
