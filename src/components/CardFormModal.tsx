import { useState } from 'react';
import type { Card, Label, Priority } from '../types';
import { ALL_LABELS, ALL_PRIORITIES, LABEL_STYLES } from '../types';

export interface CardFormValues {
  title: string;
  description: string;
  labels: Label[];
  priority: Priority;
  dueDate: string;
}

interface Props {
  /** Card being edited, or null when creating a new card. */
  initial: Card | null;
  columnTitle: string;
  onSave: (values: CardFormValues) => void;
  onClose: () => void;
}

export function CardFormModal({ initial, columnTitle, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [labels, setLabels] = useState<Label[]>(initial?.labels ?? []);
  const [priority, setPriority] = useState<Priority>(
    initial?.priority ?? 'Medium',
  );
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [error, setError] = useState('');

  const toggleLabel = (label: Label) =>
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      labels,
      priority,
      dueDate,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? 'Edit card' : 'Add card'}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {initial ? 'Edit card' : `Add card — ${columnTitle}`}
        </h2>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Title
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix login redirect on Safari"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What needs to be done?"
            className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-700">Labels</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ALL_LABELS.map((label) => {
              const active = labels.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-opacity ${
                    LABEL_STYLES[label]
                  } ${active ? '' : 'opacity-40 hover:opacity-70'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-slate-700">
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {initial ? 'Save changes' : 'Add card'}
          </button>
        </div>
      </form>
    </div>
  );
}
