"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/app-header";

type DiaryEntry = {
  id: number;
  date: string;
  text: string;
  linkLabel: string;
};

const initialEntries: DiaryEntry[] = [
  {
    id: 1,
    date: "2026-11-22",
    text: "Mentos repaid $40 from the $100 I lent for chocolate.",
    linkLabel: "Lent to Mentos · repayment",
  },
  {
    id: 2,
    date: "2026-11-18",
    text: "Lent $100 to Mentos for chocolate.",
    linkLabel: "Lent to Mentos",
  },
  {
    id: 3,
    date: "2026-11-01",
    text: "Salary came in. Set aside some for savings.",
    linkLabel: "Salary · income transaction",
  },
];

export default function DiaryPage() {
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [message, setMessage] = useState("");

  const visibleEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesSearch =
        term.length === 0 ||
        `${entry.text} ${entry.linkLabel}`.toLowerCase().includes(term);
      const matchesDate = !date || entry.date === date;
      return matchesSearch && matchesDate;
    });
  }, [entries, search, date]);

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !text.trim()) {
      setMessage("Choose a date and write a diary note.");
      return;
    }

    setEntries((current) => [
      { id: Date.now(), date, text: text.trim(), linkLabel },
      ...current,
    ]);
    setText("");
    setLinkLabel("");
    setMessage("Diary note added for this session.");
  }

  function removeEntry(id: number) {
    if (!window.confirm("Delete this diary note? Its linked transaction or debt record will remain.")) {
      return;
    }
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Diary" />

      <div className="mx-auto max-w-[1000px] space-y-6 px-5 py-7 lg:px-8">
        <div>
          <p className="text-sm font-medium text-emerald-800">Your money journal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Diary</h1>
          <p className="mt-2 text-sm text-stone-500">
            Keep dated notes connected to the money events they describe.
          </p>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold">Add a diary note</h2>
          <form onSubmit={addEntry} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Date
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Link to a record
              <select
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-normal"
                value={linkLabel}
                onChange={(event) => setLinkLabel(event.target.value)}
              >
                <option value="">No linked record</option>
                <option value="Lent to Mentos">Lent to Mentos</option>
                <option value="Mentos repayment">Mentos repayment</option>
                <option value="Salary · income transaction">Salary · income transaction</option>
              </select>
            </label>

            <label className="text-sm font-medium sm:col-span-2">
              Note
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-800"
                placeholder="What happened? Add the context you want to remember."
                value={text}
                onChange={(event) => setText(event.target.value)}
                required
              />
            </label>

            <div className="sm:col-span-2">
              <button
                className="rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white"
                type="submit"
              >
                Add note
              </button>
              {message && <p className="mt-3 text-sm text-stone-600">{message}</p>}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">Diary entries</h2>
              <p className="mt-1 text-sm text-stone-500">
                {visibleEntries.length} {visibleEntries.length === 1 ? "entry" : "entries"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
                type="search"
                placeholder="Search notes"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search diary notes"
              />
              <input
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                aria-label="Filter diary by date"
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {visibleEntries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-stone-200 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <time className="text-xs font-medium uppercase tracking-wide text-emerald-800">
                      {entry.date}
                    </time>
                    <p className="mt-2 leading-6">{entry.text}</p>
                    {entry.linkLabel && (
                      <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-950">
                        Linked: {entry.linkLabel}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="text-sm text-rose-700 underline"
                  >
                    Delete note
                  </button>
                </div>
              </article>
            ))}

            {visibleEntries.length === 0 && (
              <p className="py-10 text-center text-sm text-stone-500">
                No diary entries match your filters.
              </p>
            )}
          </div>
        </section>

        <p className="text-xs text-stone-500">
          Sample entries and links are local to this page until we connect shared database records.
        </p>
      </div>
    </main>
  );
}