import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, Column, Label, Priority } from './types';
import { uid } from './types';

const STORAGE_KEY = 'taskflow-kanban-v1';

/** ISO date (yyyy-mm-dd) `days` from today, so seed due dates stay realistic. */
function dateIn(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seedColumns(): Column[] {
  return [
    { id: 'col-todo', title: 'To Do' },
    { id: 'col-doing', title: 'In Progress' },
    { id: 'col-done', title: 'Done' },
  ];
}

function seedCards(): Card[] {
  const now = Date.now();
  const c = (
    columnId: string,
    title: string,
    description: string,
    labels: Label[],
    priority: Priority,
    dueInDays: number | null,
    ageDays: number,
  ): Card => ({
    id: uid(),
    columnId,
    title,
    description,
    labels,
    priority,
    dueDate: dueInDays === null ? '' : dateIn(dueInDays),
    createdAt: now - ageDays * 86_400_000,
  });

  return [
    c(
      'col-todo',
      'Fix checkout total rounding error',
      'Cart total is off by one cent when a 10% discount code is applied to odd-priced items. Reproduce with the SAVE10 code and a $19.99 item.',
      ['Bug'],
      'Urgent',
      1,
      6,
    ),
    c(
      'col-todo',
      'Add password reset flow',
      'Forgot-password page, reset email via the existing mail service, and a token expiry of 1 hour. Cover with an integration test.',
      ['Feature'],
      'High',
      3,
      5,
    ),
    c(
      'col-todo',
      'Redesign onboarding empty state',
      'The first-run screen is blank when a new workspace has no projects yet. Draft two variants in Figma and pick one with the team.',
      ['Design'],
      'Medium',
      5,
      4,
    ),
    c(
      'col-todo',
      'Evaluate Postgres vs SQLite for the mobile sync cache',
      'Compare write throughput and conflict handling for offline edits. Write up the trade-offs in a short doc before Friday.',
      ['Research'],
      'Low',
      7,
      3,
    ),
    c(
      'col-doing',
      'Implement drag and drop for the board',
      'Cards should move between columns with a smooth drag interaction and keep their order after a page reload.',
      ['Feature'],
      'High',
      2,
      8,
    ),
    c(
      'col-doing',
      'Write API docs for the tasks endpoint',
      'Document GET /tasks, POST /tasks and PATCH /tasks/:id with request/response examples and error codes.',
      ['Docs'],
      'Medium',
      4,
      7,
    ),
    c(
      'col-doing',
      'Fix avatar upload failing on large images',
      'Uploads over 5 MB time out. Resize client-side before upload and show a progress bar.',
      ['Bug'],
      'Medium',
      2,
      2,
    ),
    c(
      'col-doing',
      'Weekly dependency updates',
      'Bump minor versions, run the full test suite, and note any breaking changes in the changelog.',
      ['Chore'],
      'Low',
      6,
      1,
    ),
    c(
      'col-done',
      'Set up CI pipeline with GitHub Actions',
      'Lint, typecheck, tests and build on every pull request. Cache node_modules to keep runs under 3 minutes.',
      ['Chore'],
      'High',
      -9,
      12,
    ),
    c(
      'col-done',
      'Add dark mode toggle',
      'Persist the theme choice in localStorage and respect the OS preference on first visit.',
      ['Feature', 'Design'],
      'Medium',
      -6,
      11,
    ),
    c(
      'col-done',
      'Fix login redirect loop on Safari',
      'Safari blocked the session cookie because SameSite was unset. Set it explicitly and verify on iOS.',
      ['Bug'],
      'High',
      -4,
      10,
    ),
    c(
      'col-done',
      'Migrate README to the new template',
      'Add setup instructions, screenshots and a contributing section.',
      ['Docs'],
      'Low',
      -2,
      9,
    ),
  ];
}

export interface BoardState {
  columns: Column[];
  cards: Card[];
  addCard: (card: Omit<Card, 'id' | 'createdAt'>) => void;
  updateCard: (id: string, patch: Partial<Omit<Card, 'id'>>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, toColumnId: string, toIndex?: number) => void;
  addColumn: (title: string) => void;
  renameColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;
  resetBoard: () => void;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      columns: seedColumns(),
      cards: seedCards(),

      addCard: (card) =>
        set((s) => ({
          cards: [...s.cards, { ...card, id: uid(), createdAt: Date.now() }],
        })),

      updateCard: (id, patch) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),

      moveCard: (cardId, toColumnId, toIndex) =>
        set((s) => {
          const card = s.cards.find((c) => c.id === cardId);
          if (!card) return s;
          const rest = s.cards.filter((c) => c.id !== cardId);
          const moved = { ...card, columnId: toColumnId };
          if (toIndex === undefined) return { cards: [...rest, moved] };
          // Insert at `toIndex` within the destination column, keeping the
          // relative order of every other card untouched.
          const result: Card[] = [];
          let destSeen = 0;
          let inserted = false;
          for (const c of rest) {
            if (c.columnId === toColumnId && destSeen === toIndex) {
              result.push(moved);
              inserted = true;
            }
            result.push(c);
            if (c.columnId === toColumnId) destSeen++;
          }
          if (!inserted) result.push(moved);
          return { cards: result };
        }),

      addColumn: (title) =>
        set((s) => ({ columns: [...s.columns, { id: uid(), title }] })),

      renameColumn: (id, title) =>
        set((s) => ({
          columns: s.columns.map((c) => (c.id === id ? { ...c, title } : c)),
        })),

      deleteColumn: (id) =>
        set((s) => ({
          // Only empty columns can be deleted (enforced in the UI too).
          columns: s.cards.some((c) => c.columnId === id)
            ? s.columns
            : s.columns.filter((c) => c.id !== id),
        })),

      resetBoard: () =>
        set({ columns: seedColumns(), cards: seedCards() }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
    },
  ),
);

/* ---- Derived selectors (additive; no state-shape change) ---- */

/** A card is done when its column is titled "Done"; overdue when its due
    date has passed and it is not done. All counts come from live state. */
export interface BoardStats {
  total: number;
  done: number;
  donePct: number;
  overdue: number;
  columns: { id: string; title: string; count: number }[];
}

export function selectBoardStats(
  s: Pick<BoardState, 'columns' | 'cards'>,
): BoardStats {
  const doneIds = new Set(
    s.columns.filter((c) => c.title.toLowerCase() === 'done').map((c) => c.id),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let done = 0;
  let overdue = 0;
  for (const card of s.cards) {
    if (doneIds.has(card.columnId)) {
      done++;
    } else if (card.dueDate && new Date(`${card.dueDate}T00:00:00`) < today) {
      overdue++;
    }
  }
  const total = s.cards.length;
  return {
    total,
    done,
    donePct: total === 0 ? 0 : Math.round((done / total) * 100),
    overdue,
    columns: s.columns.map((c) => ({
      id: c.id,
      title: c.title,
      count: s.cards.filter((card) => card.columnId === c.id).length,
    })),
  };
}

/** All cards, most recently created first — the dense list's derived view. */
export function selectRecentTasks(s: Pick<BoardState, 'cards'>): Card[] {
  return [...s.cards].sort((a, b) => b.createdAt - a.createdAt);
}
