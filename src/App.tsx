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
import { useBoardStore } from './store';
import type { Card, Label, Priority } from './types';
import { ALL_LABELS, ALL_PRIORITIES } from './types';
import { KanbanColumn } from './components/KanbanColumn';
import { CardFormModal, type CardFormValues } from './components/CardFormModal';

type ModalState =
  | { mode: 'add'; columnId: string }
  | { mode: 'edit'; card: Card }
  | null;

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

  const modalColumnTitle =
    modal?.mode === 'add'
      ? (columns.find((c) => c.id === modal.columnId)?.title ?? '')
      : '';

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Taskflow <span className="text-indigo-600">Kanban</span>
            </h1>
            <p className="text-xs text-slate-500">
              {totalCards} cards · {doneCount} done · saved automatically in
              your browser
            </p>
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter cards by text…"
              aria-label="Filter cards by text"
              className="min-w-44 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value as Label | '')}
              aria-label="Filter by label"
              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:border-indigo-500"
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
              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">All priorities</option>
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

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
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Reset demo data
          </button>
        </div>
      </header>

      <main className="board-scroll flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full items-start gap-4 px-4 py-4 sm:px-6">
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
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={commitNewColumn}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      Add column
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingColumn(false)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingColumn(true)}
                  className="w-full rounded-2xl border border-dashed border-slate-300 px-3 py-3 text-sm font-medium text-slate-500 hover:border-indigo-300 hover:bg-white hover:text-indigo-600"
                >
                  + Add column
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="w-80 rotate-2 rounded-xl border border-indigo-300 bg-white p-3 opacity-95 shadow-xl">
                <h3 className="text-sm font-semibold text-slate-900">
                  {activeCard.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {activeCard.labels.join(' · ')}
                  {activeCard.labels.length > 0 && ' · '}
                  {activeCard.priority}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-2 text-center text-xs text-slate-400">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm delete card"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Delete card?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              “{confirmDelete.title}” will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCard(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
