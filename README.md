# Taskflow

> A drag-and-drop Kanban board with priorities, labels, due dates, and filters, saved locally in your browser.

[![Live demo](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f)](https://aghorbani84.github.io/taskflow-kanban/)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/state-Zustand-443E38)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

**Live demo:** https://aghorbani84.github.io/taskflow-kanban/

## Overview

Taskflow is a client-only Kanban board for managing work visually. Move cards between columns, track priority and due dates, and pick up where you left off: the board is persisted in `localStorage`. There is no backend, no API key, and no network call at runtime.

## Features

- **Columns** – To Do, In Progress, and Done by default; add your own, rename by clicking the title, delete empty ones
- **Drag and drop** – move cards across columns and reorder within a column (@dnd-kit)
- **Cards** – title, description, labels, priority (Low / Medium / High / Urgent), and due date; overdue and due-soon cards are highlighted
- **Filtering** – free-text search plus label and priority filters
- **All-tasks list** – a compact list view of every card, most recent first
- **Stats strip** – live totals for tasks, completed (with percentage), overdue, and columns; per-column card counts
- **Themes** – Modern and Achaemenid visual styles, each with light and dark mode
- **Persistence** – Zustand `persist` middleware stores the board in `localStorage`; first run seeds sample tasks and **Reset demo data** restores them

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 19, TypeScript, Radix UI, lucide-react icons |
| State | Zustand (with `persist` middleware) |
| Drag and drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Build & lint | Vite, oxlint |
| Deployment | GitHub Pages via GitHub Actions |

## Getting started

Requires Node.js (CI uses Node 20).

```bash
git clone https://github.com/aghorbani84/taskflow-kanban.git
cd taskflow-kanban
npm install
npm run dev        # start the dev server (usually http://localhost:5173)
```

Other scripts:

```bash
npm run build      # type-check (tsc) + production build into dist/
npm run preview    # serve the production build locally
npm run lint       # run oxlint
```

## Project structure

```
src/
├── App.tsx               # board layout, DnD context, filters
├── store.ts              # Zustand store, persistence, seed data
├── types.ts              # Card / Column / Label / Priority types
├── hooks/useTheme.ts     # style + light/dark mode
└── components/
    ├── KanbanColumn.tsx  # droppable column with count, rename, add card
    ├── KanbanCard.tsx    # sortable card with labels, priority, due date
    ├── CardFormModal.tsx # add / edit card form
    ├── AllTasksList.tsx  # compact list of all cards
    ├── StatsStrip.tsx    # live board totals
    └── ThemeSwitcher.tsx
```

## Author

Built by [aghorbani84](https://github.com/aghorbani84).
