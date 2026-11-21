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

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-sm text-ink-strong outline-none transition-shadow placeholder:text-ink-faint focus:border-accent focus:ring-[3px] focus:ring-accent-ring';

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
      className="tf-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initial ? 'Edit card' : 'Add card'}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="tf-modal w-full max-w-lg rounded-[21px] bg-white p-[21px] shadow-[0_24px_56px_-16px_rgba(0,0,0,0.25),0_8px_18px_-8px_rgba(0,0,0,0.12)]"
      >
        <h2 className="text-[21px] font-semibold leading-tight tracking-tight text-ink-strong">
          {initial ? 'Edit card' : `Add card — ${columnTitle}`}
        </h2>

        <label className="mt-5 block text-[13px] font-medium text-ink-strong">
          Title
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Fix login redirect on Safari"
            className={fieldClass}
          />
        </label>
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}

        <label className="mt-[13px] block text-[13px] font-medium text-ink-strong">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What needs to be done?"
            className={`${fieldClass} resize-none leading-relaxed`}
          />
        </label>

        <fieldset className="mt-[13px]">
          <legend className="text-[13px] font-medium text-ink-strong">Labels</legend>
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

        <div className="mt-[13px] grid grid-cols-2 gap-[13px]">
          <label className="block text-[13px] font-medium text-ink-strong">
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={fieldClass}
            >
              {ALL_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[13px] font-medium text-ink-strong">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="mt-[21px] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-[13px] py-2 text-sm font-medium text-ink transition-colors hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-accent px-[13px] py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(79,70,229,0.4)] transition-colors hover:bg-accent-strong"
          >
            {initial ? 'Save changes' : 'Add card'}
          </button>
        </div>
      </form>
    </div>
  );
}
