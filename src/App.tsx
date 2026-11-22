import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus, RotateCcw, Search, SearchX } from 'lucide-react';
import { FaravaharMark, ThemeSwitcher } from './components/ThemeSwitcher';
import { useBoardStore } from './store';
import type { Card, Label, Priority } from './types';
import { ALL_LABELS, ALL_PRIORITIES } from './types';
import { KanbanColumn } from './components/KanbanColumn';
import { CardFormModal, type CardFormValues } from './components/CardFormModal';

type ModalState =
  | { mode: 'add'; columnId: string }
  | { mode: 'edit'; card: Card }
  | null;

const controlClass =
  'h-[34px] rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink-strong outline-none transition-shadow placeholder:text-ink-faint focus:border-accent focus:ring-[3px] focus:ring-accent-ring';

export default function App() {
  const columns = useBoardStore((s) => s.columns);
  const cards = useBoardStore((s) => s.cards);
  const addCard = useBoardStore((s) => s.addCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const deleteCard = useBoardStore((s) => s.deleteCard);
  const moveCard = useBoardStore((s) => s.moveCard);
  const addColumn = useBoardStore((s) => s.addColumn);
  const renameColumn = useBoardStore((s) => s.renameColumn);
  const deleteColumn = useBoardStore((s) => s.deleteColumn);
  const resetBoard = useBoardStore((s) => s.resetBoard);

  const [search, setSearch] = useState('');
  const [labelFilter, setLabelFilter] = useState<Label | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [modal, setModal] = useState<ModalState>(null);
  const [confirmDelete, setConfirmDelete] = useState<Card | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const visibleCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      if (q && !`${c.title} ${c.description}`.toLowerCase().includes(q))
        return false;
      if (labelFilter && !c.labels.includes(labelFilter)) return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      return true;
    });
  }, [cards, search, labelFilter, priorityFilter]);

  const totalCards = cards.length;
  const doneCount = cards.filter((c) => {
    const col = columns.find((col) => col.id === c.columnId);
    return col?.title.toLowerCase() === 'done';
  }).length;
  const filtersActive =
    search.trim() !== '' || labelFilter !== '' || priorityFilter !== '';

  const handleDragStart = (e: DragStartEvent) => {
    const card = cards.find((c) => c.id === e.active.id);
    if (card) setActiveCard(card);
  };

  /** Live-move a card when it is dragged over a different column. */
  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const activeCard = cards.find((c) => c.id === active.id);
    if (!activeCard) return;

    const overCard = cards.find((c) => c.id === over.id);
    if (overCard) {
      if (overCard.columnId !== activeCard.columnId) {
        const dest = cards.filter((c) => c.columnId === overCard.columnId);
        moveCard(activeCard.id, overCard.columnId, dest.indexOf(overCard));
      }
    } else {
      // Dropped over a column container (possibly empty).
      const overColumn = columns.find((c) => c.id === over.id);
      if (overColumn && overColumn.id !== activeCard.columnId) {
        moveCard(activeCard.id, overColumn.id);
      }
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveCard(null);
    if (!over) return;
    const card = cards.find((c) => c.id === active.id);
    if (!card) return;

    const overCard = cards.find((c) => c.id === over.id);
    if (overCard) {
      if (overCard.id === card.id) return;
      const dest = cards.filter((c) => c.columnId === overCard.columnId);
      moveCard(card.id, overCard.columnId, dest.indexOf(overCard));
      return;
    }
    const overColumn = columns.find((c) => c.id === over.id);
    if (overColumn) moveCard(card.id, overColumn.id);
  };

  const saveModal = (values: CardFormValues) => {
    if (modal?.mode === 'add') {
      addCard({ ...values, columnId: modal.columnId });
    } else if (modal?.mode === 'edit') {
      updateCard(modal.card.id, values);
    }
    setModal(null);
  };

  const commitNewColumn = () => {
    const title = newColumnTitle.trim();
    if (title) addColumn(title);
    setNewColumnTitle('');
    setAddingColumn(false);
  };

  const clearFilters = () => {
    setSearch('');
    setLabelFilter('');
    setPriorityFilter('');
  };

  const modalColumnTitle =
    modal?.mode === 'add'
      ? (columns.find((c) => c.id === modal.columnId)?.title ?? '')
      : '';

  return (
    <div className="flex h-full flex-col bg-canvas text-ink-strong">
      <header className="tf-header border-b border-line bg-surface">
        <div className="flex flex-wrap items-center gap-x-[21px] gap-y-3 px-[21px] py-[13px]">
          <div className="flex shrink-0 items-start gap-2">
            <FaravaharMark className="tf-faravahar mt-1 h-[28px] w-auto text-gold-600" />
            <div>
            <h1 className="font-display text-[21px] font-bold leading-tight tracking-tight">
              Taskflow <span className="text-accent">Kanban</span>
            </h1>
            <p className="mt-[3px] text-xs leading-[1.3] text-ink">
              {totalCards} cards · {doneCount} done · saved automatically in
              your browser
            </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-44 flex-1">
              <Search
                size={15}
                strokeWidth={2}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter cards by text…"
                aria-label="Filter cards by text"
                className={`${controlClass} w-full pl-[34px]`}
              />
            </div>
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value as Label | '')}
              aria-label="Filter by label"
              className={controlClass}
            >
              <option value="">All labels</option>
              {ALL_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as Priority | '')
              }
              aria-label="Filter by priority"
              className={controlClass}
            >
              <option value="">All priorities</option>
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <ThemeSwitcher />

          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Reset the board to the sample tasks? Your current cards will be replaced.',
                )
              )
                resetBoard();
            }}
            className="flex h-[34px] shrink-0 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-sm font-medium text-ink transition-colors hover:bg-raised hover:text-ink-strong"
          >
            <RotateCcw size={14} strokeWidth={2} />
            Reset demo data
          </button>
        </div>
        <div aria-hidden="true" className="tf-double-rule" />
      </header>

      <main className="board-scroll relative flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full items-start gap-[13px] px-[21px] py-[21px]">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={visibleCards.filter((c) => c.columnId === column.id)}
                onEditCard={(card) => setModal({ mode: 'edit', card })}
                onDeleteCard={setConfirmDelete}
                onAddCard={(columnId) => setModal({ mode: 'add', columnId })}
                onRenameColumn={renameColumn}
                onDeleteColumn={deleteColumn}
              />
            ))}

            <div className="w-80 shrink-0">
              {addingColumn ? (
                <div className="tf-modal rounded-[21px] border border-line bg-surface p-[13px] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]">
                  <input
                    autoFocus
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitNewColumn();
                      if (e.key === 'Escape') setAddingColumn(false);
                    }}
                    placeholder="Column name, e.g. Review"
                    aria-label="New column name"
                    className={controlClass}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={commitNewColumn}
                      className="h-[34px] rounded-lg bg-accent px-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-strong"
                    >
                      Add column
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingColumn(false)}
                      className="h-[34px] rounded-lg px-3 text-sm font-medium text-ink hover:bg-raised"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingColumn(true)}
                  className="flex w-full items-center gap-1.5 rounded-[21px] border border-dashed border-line-strong px-[13px] py-3 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:bg-surface hover:text-accent"
                >
                  <Plus size={15} strokeWidth={2} />
                  Add column
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="tf-lifted w-80 rounded-[13px] border border-line-strong bg-surface p-[13px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.28),0_4px_12px_-4px_rgba(0,0,0,0.12)]">
                <h3 className="text-[13px] font-semibold leading-[1.4] text-ink-strong">
                  {activeCard.title}
                </h3>
                <p className="mt-1 text-xs leading-[1.3] text-ink">
                  {activeCard.labels.join(' · ')}
                  {activeCard.labels.length > 0 && ' · '}
                  {activeCard.priority}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {totalCards > 0 && visibleCards.length === 0 && filtersActive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto flex flex-col items-center rounded-[21px] border border-line bg-surface px-[34px] py-[21px] text-center shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]">
              <span className="grid size-[34px] place-items-center rounded-full bg-accent-soft text-accent">
                <SearchX size={16} strokeWidth={2} />
              </span>
              <p className="mt-[13px] text-sm font-semibold text-ink-strong">
                No cards match these filters
              </p>
              <p className="mt-1 text-xs text-ink">
                Try a different search, label or priority.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-[13px] h-[34px] rounded-lg bg-accent px-3 text-sm font-medium text-accent-text transition-colors hover:bg-accent-strong"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-line bg-surface px-[21px] py-2 text-center text-[11px] leading-[1.3] text-ink-faint">
        Drag cards between columns to change their status · Click a column
        title to rename it · All changes are stored in localStorage
      </footer>

      {modal && (
        <CardFormModal
          initial={modal.mode === 'edit' ? modal.card : null}
          columnTitle={modalColumnTitle}
          onSave={saveModal}
          onClose={() => setModal(null)}
        />
      )}

      {confirmDelete && (
        <div
          className="tf-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm delete card"
        >
          <div className="tf-modal w-full max-w-sm rounded-[21px] bg-surface p-[21px] shadow-[0_24px_56px_-16px_rgba(0,0,0,0.25),0_8px_18px_-8px_rgba(0,0,0,0.12)]">
            <h2 className="text-lg font-semibold leading-tight text-ink-strong">
              Delete card?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              “{confirmDelete.title}” will be permanently removed.
            </p>
            <div className="mt-[21px] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="h-[34px] rounded-lg px-[13px] text-sm font-medium text-ink hover:bg-raised"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCard(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="h-[34px] rounded-lg bg-red-600 px-[13px] text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
