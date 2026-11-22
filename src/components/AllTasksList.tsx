import { Pencil } from 'lucide-react';
import type { Card, Column } from '../types';
import { daysUntil } from '../types';

interface Props {
  cards: Card[];
  columns: Column[];
  onEditCard: (card: Card) => void;
}

/** Dense all-tasks list: one compact row per card, derived from the same
    store view as the board (no new state). Most recent first. */
export function AllTasksList({ cards, columns, onEditCard }: Props) {
  const columnTitle = (id: string) =>
    columns.find((c) => c.id === id)?.title ?? '—';

  return (
    <section
      aria-label={`All tasks, ${cards.length} shown`}
      className="shrink-0 border-t border-line bg-surface"
    >
      <div className="flex items-center gap-2 px-4 pb-1 pt-2 sm:px-[21px]">
        <h2 className="font-display text-[13px] font-semibold text-ink-strong">
          All tasks
        </h2>
        <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-semibold leading-[1.3] text-ink ring-1 ring-inset ring-line">
          {cards.length} shown
        </span>
      </div>
      <div className="column-scroll max-h-[168px] overflow-y-auto px-4 pb-2 sm:px-[21px]">
        {cards.length === 0 ? (
          <p className="py-3 text-xs text-ink-faint">
            No tasks match the current filters.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {cards.map((card) => {
              const days = daysUntil(card.dueDate);
              const overdue = days !== null && days < 0;
              const done =
                columnTitle(card.columnId).toLowerCase() === 'done';
              return (
                <li
                  key={card.id}
                  className="flex items-center gap-3 py-1.5 text-xs leading-[1.4]"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-ink-strong">
                    {card.title}
                  </span>
                  <span className="hidden shrink-0 rounded-full bg-raised px-2 py-0.5 text-[11px] text-ink ring-1 ring-inset ring-line sm:inline">
                    {columnTitle(card.columnId)}
                  </span>
                  <span className="hidden shrink-0 text-ink md:inline">
                    {card.labels.join(' · ') || 'No label'}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                      card.priority === 'Urgent'
                        ? 'bg-red-100 text-red-800 ring-red-200'
                        : card.priority === 'High'
                          ? 'bg-orange-100 text-orange-800 ring-orange-200'
                          : card.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-800 ring-blue-200'
                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                    }`}
                  >
                    {card.priority}
                  </span>
                  <span
                    className={`w-[86px] shrink-0 text-right ${
                      overdue
                        ? 'font-semibold text-red-700'
                        : done
                          ? 'text-ink-faint'
                          : 'text-ink'
                    }`}
                  >
                    {card.dueDate
                      ? overdue
                        ? `Overdue ${Math.abs(days ?? 0)}d`
                        : days === 0
                          ? 'Due today'
                          : `Due in ${days}d`
                      : 'No due date'}
                  </span>
                  <button
                    type="button"
                    aria-label={`Edit ${card.title}`}
                    onClick={() => onEditCard(card)}
                    className="grid size-11 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-raised hover:text-text sm:size-6"
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
