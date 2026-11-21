# Taskflow — Kanban Board

A polished Kanban board app for managing work visually: drag cards between
columns, track priorities, labels and due dates, and pick up exactly where
you left off — everything is saved in the browser.

## Features

- **Columns** — To Do, In Progress and Done out of the box; add your own,
  rename them by clicking the title, delete empty ones.
- **Drag & drop** — move cards between columns and reorder them inside a
  column with a smooth drag interaction (@dnd-kit).
- **Cards** — add, edit and delete cards with a title, description, labels,
  priority (Low / Medium / High / Urgent) and a due date. Overdue and
  due-soon cards are highlighted.
- **Filtering** — free-text search plus label and priority filters.
- **Counts** — live card count on every column header.
- **Persistence** — board state is stored in `localStorage` and restored on
  reload. First run seeds 12 realistic sample tasks; use **Reset demo data**
  to restore them at any time.

## Tech

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Zustand](https://zustand.docs.pmnd.rs/) — board state, with the `persist`
  middleware writing to `localStorage`
- [Tailwind CSS v4](https://tailwindcss.com/) — styling via the Vite plugin
- [@dnd-kit](https://dndkit.com/) (`@dnd-kit/core` + `@dnd-kit/sortable`) — drag & drop

No backend, no API keys, no network calls at runtime.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build   # typechecks (tsc) and produces a production build in dist/
npm run preview # serve the production build locally
```

## Project structure

```
src/
  App.tsx                  # board layout, DnD context, filters
  store.ts                 # Zustand store + localStorage persistence + seed data
  types.ts                 # Card / Column / Label / Priority types
  components/
    KanbanColumn.tsx       # droppable column with count, rename, add-card
    KanbanCard.tsx         # sortable card with labels, priority, due date
    CardFormModal.tsx      # add / edit card form
```

## License

MIT
