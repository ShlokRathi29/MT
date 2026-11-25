"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/app-header";

type Kind = "Lent" | "Borrowed";
type Repayment = { id: number; amountMinor: number; date: string };
type DebtRecord = {
  id: number;
  kind: Kind;
  person: string;
  originalMinor: number;
  recordedDate: string;
  dueDate: string;
  note: string;
  repayments: Repayment[];
  reminder: string | null;
};

const initialRecords: DebtRecord[] = [
  {
    id: 1,
    kind: "Lent",
    person: "Mentos",
    originalMinor: 10000,
    recordedDate: "2026-11-18",
    dueDate: "2026-11-28",
    note: "For chocolate",
    repayments: [{ id: 11, amountMinor: 4000, date: "2026-11-22" }],
    reminder: "Lent $100.00 to Mentos on Nov 18, 2026 · For chocolate",
  },
  {
    id: 2,
    kind: "Borrowed",
    person: "Alex Rivera",
    originalMinor: 35000,
    recordedDate: "2026-11-15",
    dueDate: "2026-12-18",
    note: "Personal loan",
    repayments: [],
    reminder: "Borrowed $350.00 from Alex Rivera · Personal loan",
  },
];

function money(minor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(minor / 100);
}

function parseMinor(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

function paid(record: DebtRecord) {
  return record.repayments.reduce((sum, item) => sum + item.amountMinor, 0);
}

function remaining(record: DebtRecord) {
  return Math.max(0, record.originalMinor - paid(record));
}

function recordStatus(record: DebtRecord) {
  if (remaining(record) === 0) return "Repaid";
  return paid(record) > 0 ? "Partially paid" : "Open";
}

export default function DebtsPage() {
  const [records, setRecords] = useState(initialRecords);
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Kind>("All");

  const [kind, setKind] = useState<Kind>("Lent");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [recordedDate, setRecordedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [repaymentDate, setRepaymentDate] = useState("");
  const [repaymentMessage, setRepaymentMessage] = useState("");

  const visibleRecords = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesKind = filter === "All" || record.kind === filter;
      const matchesSearch =
        term.length === 0 ||
        `${record.person} ${record.note}`.toLowerCase().includes(term);
      return matchesKind && matchesSearch;
    });
  }, [records, filter, query]);

  const selected = records.find((record) => record.id === selectedId) ?? null;
  const lentTotal = records
    .filter((record) => record.kind === "Lent")
    .reduce((sum, record) => sum + remaining(record), 0);
  const borrowedTotal = records
    .filter((record) => record.kind === "Borrowed")
    .reduce((sum, record) => sum + remaining(record), 0);

  function addRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountMinor = parseMinor(amount);

    if (!person.trim() || amountMinor === null || amountMinor <= 0 || !recordedDate || !dueDate) {
      setFormMessage("Enter a person, valid amount, recorded date, and due date.");
      return;
    }

    const id = Date.now();
    const newRecord: DebtRecord = {
      id,
      kind,
      person: person.trim(),
      originalMinor: amountMinor,
      recordedDate,
      dueDate,
      note: note.trim(),
      repayments: [],
      reminder: `${kind === "Lent" ? "Lent" : "Borrowed"} ${money(amountMinor)} ${
        kind === "Lent" ? "to" : "from"
      } ${person.trim()} on ${recordedDate}${note.trim() ? ` · ${note.trim()}` : ""}`,
    };

    setRecords((items) => [newRecord, ...items]);
    setSelectedId(id);
    setPerson("");
    setAmount("");
    setRecordedDate("");
    setDueDate("");
    setNote("");
    setFormMessage("Record and linked diary reminder added for this session.");
  }

  function addRepayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    const amountMinor = parseMinor(repaymentAmount);
    if (amountMinor === null || amountMinor <= 0 || amountMinor > remaining(selected) || !repaymentDate) {
      setRepaymentMessage("Enter a valid repayment amount no greater than the remaining balance.");
      return;
    }

    setRecords((items) =>
      items.map((record) =>
        record.id === selected.id
          ? {
              ...record,
              repayments: [
                ...record.repayments,
                { id: Date.now(), amountMinor, date: repaymentDate },
              ],
            }
          : record,
      ),
    );
    setRepaymentAmount("");
    setRepaymentDate("");
    setRepaymentMessage("Repayment recorded. Ledger linking comes with database integration.");
  }

  function removeReminder(id: number) {
    setRecords((items) =>
      items.map((record) => (record.id === id ? { ...record, reminder: null } : record)),
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Lending & Borrowing" />

      <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-7 lg:px-8">
        <div>
          <p className="text-sm font-medium text-emerald-800">People and repayments</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Lending &amp; Borrowing</h1>
          <p className="mt-2 text-sm text-stone-500">
            Track what you lent, what you borrowed, and repayment history.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <Summary label="Still owed to you" amount={money(lentTotal)} />
          <Summary label="You still owe" amount={money(borrowedTotal)} />
        </section>

        <section className="grid items-start gap-5 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">All records</h2>
            <input
              className="mt-4 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800"
              type="search"
              placeholder="Search person or note"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search lending and borrowing records"
            />
            <div className="mt-3 flex gap-2">
              {(["All", "Lent", "Borrowed"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    filter === item
                      ? "border-emerald-900 bg-emerald-900 text-white"
                      : "border-stone-300 text-stone-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {visibleRecords.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => setSelectedId(record.id)}
                  className={`w-full rounded-xl border p-4 text-left ${
                    selectedId === record.id
                      ? "border-emerald-800 bg-emerald-50/60"
                      : "border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <span className="font-semibold">
                      {record.kind} {record.kind === "Lent" ? "to" : "from"} {record.person}
                    </span>
                    <span className="text-xs text-stone-500">{recordStatus(record)}</span>
                  </div>
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-stone-500">Remaining</span>
                    <span className="font-medium">{money(remaining(record))}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-stone-500">
                    <span>Due {record.dueDate}</span>
                    <span>Original {money(record.originalMinor)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="space-y-5">
              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-500">{selected.kind}</p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      {selected.kind} {selected.kind === "Lent" ? "to" : "from"} {selected.person}
                    </h2>
                    <p className="mt-2 text-sm text-stone-500">
                      Due {selected.dueDate} · {selected.note || "No note"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm text-emerald-950">
                    {recordStatus(selected)}
                  </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-emerald-800"
                    style={{
                      width: `${Math.min(100, (paid(selected) / selected.originalMinor) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span>{money(paid(selected))} repaid of {money(selected.originalMinor)}</span>
                  <span className="font-semibold">{money(remaining(selected))} remaining</span>
                </div>

                {selected.reminder && (
                  <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Linked diary reminder</p>
                        <p className="mt-1 text-sm text-stone-600">{selected.reminder}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReminder(selected.id)}
                        className="text-sm text-rose-700 underline"
                      >
                        Remove reminder
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">Record a repayment</h3>
                <form onSubmit={addRepayment} className="mt-4 grid gap-3 sm:grid-cols-3">
                  <input
                    className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm"
                    inputMode="decimal"
                    placeholder="Amount"
                    value={repaymentAmount}
                    onChange={(event) => setRepaymentAmount(event.target.value)}
                    aria-label="Repayment amount"
                  />
                  <input
                    className="rounded-xl border border-stone-300 px-3 py-2.5 text-sm"
                    type="date"
                    value={repaymentDate}
                    onChange={(event) => setRepaymentDate(event.target.value)}
                    aria-label="Repayment date"
                  />
                  <button
                    className="rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white"
                    type="submit"
                  >
                    Add repayment
                  </button>
                </form>
                {repaymentMessage && <p className="mt-3 text-sm text-stone-600">{repaymentMessage}</p>}

                <h3 className="mt-6 font-semibold">Repayment history</h3>
                {selected.repayments.length === 0 ? (
                  <p className="mt-3 text-sm text-stone-500">No repayments recorded yet.</p>
                ) : (
                  <div className="mt-3 divide-y divide-stone-100">
                    {selected.repayments.map((item) => (
                      <div className="flex justify-between py-3 text-sm" key={item.id}>
                        <span className="text-stone-500">{item.date}</span>
                        <span className="font-medium">{money(item.amountMinor)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-stone-500">
              No records match your search.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold">Add a lending or borrowing record</h2>
          <form onSubmit={addRecord} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="text-sm font-medium">
              Record type
              <select
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5"
                value={kind}
                onChange={(event) => setKind(event.target.value as Kind)}
              >
                <option value="Lent">Money lent</option>
                <option value="Borrowed">Money borrowed</option>
              </select>
            </label>
            <Field label="Person" value={person} onChange={setPerson} placeholder="Name" />
            <Field label="Amount (USD)" value={amount} onChange={setAmount} placeholder="0.00" />
            <label className="text-sm font-medium">
              Recorded date
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5"
                type="date"
                required
                value={recordedDate}
                onChange={(event) => setRecordedDate(event.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Due date
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5"
                type="date"
                required
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
            <Field label="Note or purpose" value={note} onChange={setNote} placeholder="Optional" />
            <div className="xl:col-span-3">
              <button className="rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white" type="submit">
                Add record
              </button>
              {formMessage && <p className="mt-3 text-sm text-stone-600">{formMessage}</p>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Summary({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{amount}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}