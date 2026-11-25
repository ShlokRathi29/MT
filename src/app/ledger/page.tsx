"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";

type EntryType = "Income" | "Expense" | "Transfer" | "Lent" | "Repayment";

type Entry = {
  id: number;
  date: string;
  description: string;
  category: string;
  type: EntryType;
  amountMinor: number;
  account: string;
};

const entries: Entry[] = [
  { id: 1, date: "2026-11-22", description: "Freelance payment", category: "Work", type: "Income", amountMinor: 120000, account: "Checking" },
  { id: 2, date: "2026-11-21", description: "Rent payment", category: "Housing", type: "Expense", amountMinor: 150000, account: "Checking" },
  { id: 3, date: "2026-11-20", description: "Groceries", category: "Food", type: "Expense", amountMinor: 8520, account: "Checking" },
  { id: 4, date: "2026-11-18", description: "Lent to Mentos · chocolate", category: "Personal", type: "Lent", amountMinor: 10000, account: "Checking" },
  { id: 5, date: "2026-11-22", description: "Repayment from Mentos", category: "Debt repayment", type: "Repayment", amountMinor: 4000, account: "Checking" },
  { id: 6, date: "2026-11-17", description: "Checking to Savings", category: "Account transfer", type: "Transfer", amountMinor: 100000, account: "Checking → Savings" },
  { id: 7, date: "2026-11-01", description: "Salary", category: "Work", type: "Income", amountMinor: 260000, account: "Checking" },
];

const filters = ["All", "Income", "Expense", "Transfer", "Lent", "Repayment"] as const;

function money(amountMinor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountMinor / 100);
}

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default function LedgerPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [search, setSearch] = useState("");

  const visibleEntries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesType = activeFilter === "All" || entry.type === activeFilter;
      const matchesSearch =
        query.length === 0 ||
        `${entry.description} ${entry.category} ${entry.account}`.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [activeFilter, search]);

  const income = entries
    .filter((entry) => entry.type === "Income")
    .reduce((total, entry) => total + entry.amountMinor, 0);

  const expenses = entries
    .filter((entry) => entry.type === "Expense")
    .reduce((total, entry) => total + entry.amountMinor, 0);

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Ledger" />

      <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-7 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-800">November 2026</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Ledger</h1>
            <p className="mt-2 text-sm text-stone-500">
              Search and review your recorded money activity.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium">
              Export CSV
            </button>
            <button className="rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white">
              + Add transaction
            </button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Monthly totals">
          <Summary label="Income" value={money(income)} tone="green" />
          <Summary label="Expenses" value={money(expenses)} tone="red" />
          <Summary label="Income minus expenses" value={money(income - expenses)} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-stone-100 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-semibold">All records</h2>
              <label className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-stone-300 px-3 py-2.5 text-sm text-stone-400">
                <span aria-hidden="true">⌕</span>
                <input
                  className="w-full bg-transparent text-stone-900 outline-none placeholder:text-stone-400"
                  type="search"
                  placeholder="Search description, category, account"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search ledger records"
                />
              </label>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                    activeFilter === filter
                      ? "border-emerald-900 bg-emerald-900 text-white"
                      : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-stone-100 hover:bg-stone-50/70">
                    <td className="whitespace-nowrap px-5 py-4 text-stone-500">
                      {displayDate(entry.date)}
                    </td>
                    <td className="px-5 py-4 font-medium">{entry.description}</td>
                    <td className="px-5 py-4 text-stone-500">{entry.category}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-500">{entry.account}</td>
                    <td className={`whitespace-nowrap px-5 py-4 text-right font-semibold ${
                      entry.type === "Income" || entry.type === "Repayment"
                        ? "text-emerald-800"
                        : entry.type === "Expense" || entry.type === "Lent"
                          ? "text-rose-700"
                          : "text-stone-600"
                    }`}>
                      {entry.type === "Income" || entry.type === "Repayment"
                        ? "+"
                        : entry.type === "Transfer"
                          ? ""
                          : "−"}
                      {money(entry.amountMinor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleEntries.length === 0 && (
              <p className="px-5 py-12 text-center text-sm text-stone-500">
                No records match your search.
              </p>
            )}
          </div>

          <div className="border-t border-stone-100 px-5 py-3 text-xs text-stone-500">
            Sample records only. Repayments and transfers are kept separate from earned income.
          </div>
        </section>
      </div>
    </main>
  );
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red";
}) {
  const amountColor =
    tone === "green" ? "text-emerald-800" : tone === "red" ? "text-rose-700" : "text-stone-900";

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${amountColor}`}>{value}</p>
    </div>
  );
}