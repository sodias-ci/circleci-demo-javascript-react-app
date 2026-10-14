import { useId, useState } from 'react';
import type { FormEvent } from 'react';

export default function Comments({ photoTitle }: { photoTitle: string }) {
  const [comments, setComments] = useState<{ id: number; text: string }[]>([]);
  const [draft, setDraft] = useState('');
  const inputId = useId();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [...prev, { id: prev.length, text }]);
    setDraft('');
  };

  return (
    <section className="px-5 pb-2" aria-label={`Comments on ${photoTitle}`}>
      {comments.length > 0 && (
        <ul className="mb-2 space-y-1 text-sm">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded bg-zinc-100 px-3 py-1">
              {comment.text}
            </li>
          ))}
        </ul>
      )}
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="sr-only">
          Add a comment on {photoTitle}
        </label>
        <input
          id={inputId}
          type="text"
          className="min-w-0 flex-1 rounded border border-zinc-300 px-3 py-1 text-sm"
          placeholder="Add a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          className="cursor-pointer rounded bg-zinc-800 px-3 py-1 text-sm text-white hover:bg-zinc-700"
        >
          Post
        </button>
      </form>
    </section>
  );
}
