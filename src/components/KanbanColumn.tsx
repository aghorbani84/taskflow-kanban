import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, X } from 'lucide-react';
import type { Card, Column } from '../types';
import { KanbanCard } from './KanbanCard';

interface Props {
  column: Column;
  cards: Card[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
  onAddCard: (columnId: string) => void;
  onRenameColumn: (id: string, title: string) => void;
  onDeleteColumn: (id: string) => void;
}

/** One status colour per column, by name — the only colour on the pane
    chrome. Unknown (user-added) columns get the accent. */
function statusDot(title: string): string {
  const t = title.toLowerCase();
  if (t === 'to do') return 'bg-slate-400';
  if (t === 'in progress') return 'bg-amber-400';
  if (t === 'done') return 'bg-emerald-500';
  return 'bg-indigo-500';
}

export function KanbanColumn({
  column,
  cards,
  onEditCard,
  onDeleteCard,
  onAddCard,
  onRenameColumn,
  onDeleteColumn,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(column.title);

  const commitTitle = () => {
    const title = titleDraft.trim();
    if (title && title !== column.title) onRenameColumn(column.id, title);
    else setTitleDraft(column.title);
    setEditingTitle(false);
  };

  return (
    <section
      ref={setNodeRef}
      className={`flex w-80 shrink-0 flex-col rounded-[21px] border p-[13px] transition-colors duration-150 ${
        isOver
          ? 'border-accent/60 bg-accent-soft/60'
          : 'border-line bg-well'
      }`}
      aria-label={`${column.title} column, ${cards.length} cards`}
    >
      <header className="mb-[13px] flex items-center gap-2 px-1 pt-[3px]">
        <span
          aria-hidden="true"
          className={`size-2 shrink-0 rounded-full ${statusDot(column.title)}`}
        />
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') {
                setTitleDraft(column.title);
                setEditingTitle(false);
              }
            }}
            className="h-[26px] min-w-0 flex-1 rounded-md border border-accent bg-surface px-2 text-[13px] font-semibold text-ink-strong outline-none"
            aria-label="Column title"
          />
        ) : (
          <h2
            className="font-display cursor-text truncate text-[13px] font-semibold text-ink-strong"
            title="Click to rename"
            onClick={() => setEditingTitle(true)}
          >
            {column.title}
          </h2>
        )}
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold leading-[1.3] text-ink ring-1 ring-line">
          {cards.length}
        </span>
        <button
          type="button"
          aria-label={`Delete column ${column.title}`}
          title={
            cards.length > 0
              ? 'Move or delete all cards first'
              : `Delete column ${column.title}`
          }
          disabled={cards.length > 0}
          onClick={() => onDeleteColumn(column.id)}
          className="ml-auto grid size-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </header>

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="column-scroll flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
          {cards.length === 0 && (
            <p className="rounded-[13px] border border-dashed border-line-strong px-3 py-6 text-center text-xs text-ink-faint">
              Drop cards here
            </p>
          )}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={() => onAddCard(column.id)}
        className="mt-[13px] flex items-center gap-1.5 rounded-[13px] px-2.5 py-2 text-left text-[13px] font-medium text-ink transition-colors hover:bg-surface hover:text-ink-strong hover:shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
      >
        <Plus size={15} strokeWidth={2} />
        Add card
      </button>
    </section>
  );
}
