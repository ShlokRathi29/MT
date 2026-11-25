"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/app-header";

type Investment = {
  id: number;
  name: string;
  provider: string;
  investedMinor: number;
  currentMinor: number;
  valuationDate: string;
  notes: string;
};

const initialInvestments: Investment[] = [
  { id: 1, name: "Index fund", provider: "Example provider", investedMinor: 800000, currentMinor: 960000, valuationDate: "2026-11-24", notes: "Long-term holding" },
  { id: 2, name: "Fixed deposit", provider: "Example bank", investedMinor: 500000, currentMinor: 530000, valuationDate: "2026-11-24", notes: "" },
  { id: 3, name: "Gold", provider: "Manual record", investedMinor: 300000, currentMinor: 350000, valuationDate: "2026-11-24", notes: "" },
];

function parseMinor(value: string): number | null {
  const match = /^(\d+)(?:\.(\d{0,2}))?$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
}

function money(amountMinor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountMinor / 100);
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState(initialInvestments);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [invested, setInvested] = useState("");
  const [current, setCurrent] = useState("");
  const [valuationDate, setValuationDate] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const totals = useMemo(
    () => investments.reduce(
      (sum, item) => ({
        invested: sum.invested + item.investedMinor,
        current: sum.current + item.currentMinor,
      }),
      { invested: 0, current: 0 },
    ),
    [investments],
  );

  function addInvestment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const investedMinor = parseMinor(invested);
    const currentMinor = parseMinor(current);

    if (!name.trim() || investedMinor === null || currentMinor === null || !valuationDate) {
      setMessage("Enter a name, valid amounts, and a valuation date.");
      return;
    }

    setInvestments((items) => [
      ...items,
      {
        id: Date.now(),
        name: name.trim(),
        provider: provider.trim() || "Not specified",
        investedMinor,
        currentMinor,
        valuationDate,
        notes: notes.trim(),
      },
    ]);

    setName("");
    setProvider("");
    setInvested("");
    setCurrent("");
    setValuationDate("");
    setNotes("");
    setMessage("Added for this session. Database saving comes later.");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Investments" />

      <div className="mx-auto max-w-[1200px] space-y-6 px-5 py-7 lg:px-8">
        <div>
          <p className="text-sm font-medium text-emerald-800">Manual tracking</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Investments</h1>
          <p className="mt-2 text-sm text-stone-500">
            Enter and update values yourself. No live prices or brokerage connection.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Investment totals">
          <Summary label="Current value" value={money(totals.current)} />
          <Summary label="Contributions" value={money(totals.invested)} />
          <Summary label="Change from contributions" value={money(totals.current - totals.invested)} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 p-5 sm:p-6">
            <h2 className="font-semibold">Your investments</h2>
            <p className="mt-1 text-sm text-stone-500">Current values are based on your last manual update.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Investment</th>
                  <th className="px-5 py-3 font-medium">Provider</th>
                  <th className="px-5 py-3 font-medium">Contributed</th>
                  <th className="px-5 py-3 font-medium">Current value</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((item) => (
                  <tr key={item.id} className="border-t border-stone-100">
                    <td className="px-5 py-4">
                      <p className="font-medium">{item.name}</p>
                      {item.notes && <p className="mt-1 text-xs text-stone-500">{item.notes}</p>}
                    </td>
                    <td className="px-5 py-4 text-stone-500">{item.provider}</td>
                    <td className="px-5 py-4">{money(item.investedMinor)}</td>
                    <td className="px-5 py-4 font-semibold">{money(item.currentMinor)}</td>
                    <td className="px-5 py-4 text-stone-500">{item.valuationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold">Add an investment</h2>
          <form onSubmit={addInvestment} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Investment name">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Index fund" />
            </Field>
            <Field label="Provider or account">
              <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Total contributed (USD)">
              <input required inputMode="decimal" value={invested} onChange={(e) => setInvested(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Current value (USD)">
              <input required inputMode="decimal" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="0.00" />
            </Field>
            <Field label="Value as of">
              <input required type="date" value={valuationDate} onChange={(e) => setValuationDate(e.target.value)} />
            </Field>
            <Field label="Notes">
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" />
            </Field>
            <div className="sm:col-span-2">
              <button className="rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white" type="submit">
                Add investment
              </button>
              {message && <p className="mt-3 text-sm text-stone-600">{message}</p>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium">
      {label}
      {<div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-stone-300 [&_input]:px-3 [&_input]:py-2.5 [&_input]:font-normal [&_input]:outline-none [&_input]:focus:border-emerald-800">{children}</div>}
    </label>
  );
}