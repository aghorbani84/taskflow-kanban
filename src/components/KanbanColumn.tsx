import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
      className={`flex w-80 shrink-0 flex-col rounded-2xl border p-3 transition-colors ${
        isOver
          ? 'border-indigo-300 bg-indigo-50/70'
          : 'border-slate-200 bg-slate-100/70'
      }`}
      aria-label={`${column.title} column, ${cards.length} cards`}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
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
            className="min-w-0 flex-1 rounded-md border border-indigo-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 outline-none"
            aria-label="Column title"
          />
        ) : (
          <h2
            className="cursor-text truncate text-sm font-semibold text-slate-800"
            title="Click to rename"
            onClick={() => setEditingTitle(true)}
          >
            {column.title}
          </h2>
        )}
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
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
          className="ml-auto rounded-md px-1.5 py-0.5 text-sm leading-none text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
        >
          ×
        </button>
      </header>

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto">
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
          {cards.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
              Drop cards here
            </p>
          )}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={() => onAddCard(column.id)}
        className="mt-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-white hover:text-slate-800 hover:shadow-sm"
      >
        + Add card
      </button>
    </section>
  );
}
