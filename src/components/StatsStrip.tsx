import type { BoardStats } from '../store';

/**
 * Proof strip, rendered from live store state on every change.
 * Format: "12 tasks · 4 done (33%) · 0 overdue · 3 columns".
 * Token-only styling: recolors in all four theme combos.
 */
export function StatsStrip({ stats }: { stats: BoardStats }) {
  return (
    <div className="shrink-0 border-b border-line bg-surface px-4 py-2.5 sm:px-[21px]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p
          aria-live="polite"
          className="text-[13px] font-semibold leading-[1.4] text-ink-strong"
        >
          {stats.total} tasks · {stats.done} done ({stats.donePct}%) ·{' '}
          {stats.overdue} overdue · {stats.columns.length} columns
        </p>
        <div
          className="h-1.5 w-32 overflow-hidden rounded-full bg-raised"
          role="progressbar"
          aria-valuenow={stats.donePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${stats.donePct}% complete`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200"
            style={{ width: `${stats.donePct}%` }}
          />
        </div>
        <ul className="flex flex-wrap items-center gap-1.5">
          {stats.columns.map((col) => (
            <li
              key={col.id}
              className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-medium leading-[1.3] text-ink ring-1 ring-inset ring-line"
            >
              {col.title} · {col.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
