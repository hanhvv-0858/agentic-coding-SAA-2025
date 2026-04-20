"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Department, Hashtag } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import { track } from "@/libs/analytics/track";
import { FilterDropdown, type FilterDropdownOption } from "./FilterDropdown";
import { Icon } from "@/components/ui/Icon";

type FilterBarProps = {
  hashtag: string | null;
  department: string | null;
  hashtags: Hashtag[];
  departments: Department[];
  messages: Messages;
};

/**
 * §B.1 FilterBar — composes B.1.1 HashtagFilter + B.1.2 DepartmentFilter
 * plus an active-filter-chip row. Selection writes to the URL via
 * `router.replace()` (FR-020 — URL-shareable + no history pollution)
 * so the RSC at /kudos can re-run `getKudoFeed` with the updated
 * `FilterState`. Emits `kudos_filter_apply` on every change (including
 * a `"(cleared)"` payload when the user removes a chip).
 */
export function FilterBar({
  hashtag,
  department,
  hashtags,
  departments,
  messages,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hashtagOptions = useMemo<FilterDropdownOption[]>(
    () => hashtags.map((h) => ({ value: h.slug, label: `#${h.label}` })),
    [hashtags],
  );
  const departmentOptions = useMemo<FilterDropdownOption[]>(
    () => departments.map((d) => ({ value: d.code, label: d.label })),
    [departments],
  );

  const activeHashtagLabel = useMemo(() => {
    if (!hashtag) return null;
    const hit = hashtags.find((h) => h.slug === hashtag);
    return hit ? `#${hit.label}` : `#${hashtag}`;
  }, [hashtags, hashtag]);

  const activeDepartmentLabel = useMemo(() => {
    if (!department) return null;
    const hit = departments.find((d) => d.code === department);
    return hit ? hit.label : department;
  }, [departments, department]);

  const updateParam = useCallback(
    (key: "hashtag" | "department", next: string | null) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (next) params.set(key, next);
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      track({
        type: "kudos_filter_apply",
        kind: key,
        value: next ?? "(cleared)",
      });
    },
    [pathname, router, searchParams],
  );

  const clearLabel = messages.kudos.filters.clearLabel;
  const clearHashtagAria = messages.kudos.filters.clearHashtagAria;
  const clearDepartmentAria = messages.kudos.filters.clearDepartmentAria;
  const activeFiltersAria = messages.kudos.filters.activeFiltersAria;

  const hasActive = !!hashtag || !!department;

  return (
    <div className="flex w-full flex-col items-start gap-4" data-testid="kudos-filter-bar">
      <div className="flex w-full flex-wrap items-center gap-3">
        <FilterDropdown
          kind="hashtag"
          options={hashtagOptions}
          value={hashtag}
          onSelect={(next) => updateParam("hashtag", next)}
          messages={messages}
          disabled={hashtagOptions.length === 0}
        />
        <FilterDropdown
          kind="department"
          options={departmentOptions}
          value={department}
          onSelect={(next) => updateParam("department", next)}
          messages={messages}
          disabled={departmentOptions.length === 0}
        />
        {hasActive ? (
          <button
            type="button"
            onClick={() => {
              if (hashtag) updateParam("hashtag", null);
              if (department) updateParam("department", null);
            }}
            className="font-[family-name:var(--font-montserrat)] text-sm font-bold text-white/70 underline underline-offset-2 hover:text-[var(--color-accent-cream)]"
            data-testid="kudos-filter-clear-all"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>

      {hasActive ? (
        <ul
          aria-label={activeFiltersAria}
          className="flex flex-wrap items-center gap-2"
          data-testid="kudos-filter-chips"
        >
          {activeHashtagLabel ? (
            <li>
              <ActiveChip
                label={activeHashtagLabel}
                ariaClear={clearHashtagAria}
                onClear={() => updateParam("hashtag", null)}
                testid="kudos-filter-chip-hashtag"
              />
            </li>
          ) : null}
          {activeDepartmentLabel ? (
            <li>
              <ActiveChip
                label={activeDepartmentLabel}
                ariaClear={clearDepartmentAria}
                onClear={() => updateParam("department", null)}
                testid="kudos-filter-chip-department"
              />
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

function ActiveChip({
  label,
  ariaClear,
  onClear,
  testid,
}: {
  label: string;
  ariaClear: string;
  onClear: () => void;
  testid: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-cream)] bg-[rgba(255,234,158,0.20)] px-3 py-1 text-sm font-bold text-[var(--color-accent-cream)]"
      data-testid={testid}
    >
      <span>{label}</span>
      <button
        type="button"
        aria-label={ariaClear}
        onClick={onClear}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--color-accent-cream)]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]"
      >
        <Icon name="close" size={12} />
      </button>
    </span>
  );
}
