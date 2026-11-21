import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
      className={`group rounded-xl border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging
          ? 'border-indigo-300 opacity-40'
          : 'border-slate-200'
      } cursor-grab active:cursor-grabbing`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-slate-900">
          {card.title}
        </h3>
        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            aria-label={`Edit ${card.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded-md px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete ${card.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="rounded-md px-1.5 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {card.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {card.description}
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {card.labels.map((label) => (
          <span
            key={label}
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${LABEL_STYLES[label]}`}
          >
            {label}
          </span>
        ))}
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${PRIORITY_STYLES[card.priority]}`}
        >
          {card.priority}
        </span>
        {card.dueDate && (
          <span
            className={`ml-auto rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
              overdue
                ? 'bg-red-100 text-red-700'
                : dueSoon
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
            }`}
            title={`Due ${card.dueDate}`}
          >
            {overdue
              ? `Overdue ${Math.abs(days ?? 0)}d`
              : days === 0
                ? 'Due today'
                : `Due in ${days}d`}
          </span>
        )}
      </div>
    </article>
  );
}
