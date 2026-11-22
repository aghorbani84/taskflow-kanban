import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { Card } from '../types';
import { LABEL_STYLES, PRIORITY_STYLES, daysUntil } from '../types';

interface Props {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
}

export function KanbanCard({ card, onEdit, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const days = daysUntil(card.dueDate);
  const overdue = days !== null && days < 0;
  const dueSoon = days !== null && days >= 0 && days <= 2;

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`group relative rounded-[13px] border bg-surface p-[13px] pl-[9px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-150 hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.12)] ${
        isDragging
          ? 'border-accent opacity-40'
          : 'border-line'
      } cursor-grab active:cursor-grabbing`}
    >
      <div className="flex items-start gap-1">
        {/* Drag grip: the affordance the reorder story hangs on. Faint at
            rest, full on hover — always visible so the board reads as
            draggable even before the pointer arrives. */}
        <span
          aria-hidden="true"
          className="mt-[1px] flex shrink-0 items-center text-ink-faint opacity-60 transition-opacity group-hover:text-ink group-hover:opacity-100"
        >
          <GripVertical size={16} strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13px] font-semibold leading-[1.4] text-ink-strong">
              {card.title}
            </h3>
            <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                aria-label={`Edit ${card.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(card);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-raised hover:text-text"
              >
                <Pencil size={14} strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label={`Delete ${card.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="grid size-6 place-items-center rounded-md text-ink-faint hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {card.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink">
              {card.description}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {card.labels.map((label) => (
              <span
                key={label}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium leading-[1.3] ring-1 ring-inset ${LABEL_STYLES[label]}`}
              >
                {label}
              </span>
            ))}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium leading-[1.3] ring-1 ring-inset ${PRIORITY_STYLES[card.priority]}`}
            >
              {card.priority}
            </span>
            {card.dueDate && (
              <span
                className={`ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-[1.3] ${
                  overdue
                    ? 'bg-red-100 text-red-700'
                    : dueSoon
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                }`}
                title={`Due ${card.dueDate}`}
              >
                <Calendar size={11} strokeWidth={2} />
                {overdue
                  ? `Overdue ${Math.abs(days ?? 0)}d`
                  : days === 0
                    ? 'Due today'
                    : `Due in ${days}d`}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
