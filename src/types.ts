export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Label =
  | 'Bug'
  | 'Feature'
  | 'Design'
  | 'Docs'
  | 'Research'
  | 'Chore';

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string;
  labels: Label[];
  priority: Priority;
  /** ISO date string (yyyy-mm-dd) or '' when unset */
  dueDate: string;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
}

export const ALL_LABELS: Label[] = [
  'Bug',
  'Feature',
  'Design',
  'Docs',
  'Research',
  'Chore',
];

export const ALL_PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export const LABEL_STYLES: Record<Label, string> = {
  Bug: 'bg-red-100 text-red-800 ring-red-200',
  Feature: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Design: 'bg-violet-100 text-violet-800 ring-violet-200',
  Docs: 'bg-sky-100 text-sky-800 ring-sky-200',
  Research: 'bg-amber-100 text-amber-800 ring-amber-200',
  Chore: 'bg-slate-200 text-slate-700 ring-slate-300',
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
  Medium: 'bg-blue-100 text-blue-800 ring-blue-200',
  High: 'bg-orange-100 text-orange-800 ring-orange-200',
  Urgent: 'bg-red-100 text-red-800 ring-red-200',
};

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Days from today until the due date (negative = overdue). null when unset. */
export function daysUntil(dueDate: string): number | null {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueDate}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}
