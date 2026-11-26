"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/app-header";

type Period = "Daily" | "Weekly" | "Monthly" | "Yearly";

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

export default function GoalsPage() {
  const [period, setPeriod] = useState<Period>("Monthly");
  const [target, setTarget] = useState("6000.00");
  const [startsOn, setStartsOn] = useState("2026-11-01");
  const [endsOn, setEndsOn] = useState("2026-11-30");
  const [savedGoal, setSavedGoal] = useState({
    period: "Monthly" as Period,
    targetMinor: 600000,
    startsOn: "2026-11-01",
    endsOn: "2026-11-30",
  });
  const [message, setMessage] = useState("");

  // Placeholder until goal progress is calculated from saved income records.
  const demoIncomeMinor = 520000;
  const progress = useMemo(
    () => savedGoal.targetMinor > 0
      ? Math.min(100, (demoIncomeMinor / savedGoal.targetMinor) * 100)
      : 0,
    [savedGoal.targetMinor],
  );
  const remaining = Math.max(0, savedGoal.targetMinor - demoIncomeMinor);

  function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetMinor = parseMinor(target);

    if (targetMinor === null || targetMinor <= 0 || !startsOn || !endsOn || startsOn > endsOn) {
      setMessage("Enter a valid target and a date range where the end is after the start.");
      return;
    }

    setSavedGoal({ period, targetMinor, startsOn, endsOn });
    setMessage("Goal updated for this session. Permanent saving comes with database setup.");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Goals" />

      <div className="mx-auto max-w-[1100px] space-y-6 px-5 py-7 lg:px-8">
        <div>
          <p className="text-sm font-medium text-emerald-800">Plan your earnings</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Income goal</h1>
          <p className="mt-2 text-sm text-stone-500">
            Set a target and follow qualifying income during the period.
          </p>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500">{savedGoal.period} goal</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-stone-500">Earned toward target</p>
              <p className="mt-1 text-xl font-semibold">
                {money(demoIncomeMinor)} <span className="font-normal text-stone-400">of</span>{" "}
                {money(savedGoal.targetMinor)}
              </p>
            </div>
          </div>

          <div
            className="mt-6 h-4 overflow-hidden rounded-full bg-stone-100"
            role="progressbar"
            aria-label="Income goal progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="h-full rounded-full bg-emerald-800 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-4 text-sm text-stone-500">
            {remaining > 0
              ? `${money(remaining)} remaining in this goal.`
              : "You’ve reached this goal."}
            {" "}Period: {savedGoal.startsOn} to {savedGoal.endsOn}.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold">Edit goal</h2>
          <form onSubmit={saveGoal} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Goal period
              <select
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-normal"
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </label>

            <label className="text-sm font-medium">
              Target amount (USD)
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal"
                inputMode="decimal"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                placeholder="0.00"
                required
              />
            </label>

            <label className="text-sm font-medium">
              Starts on
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal"
                type="date"
                value={startsOn}
                onChange={(event) => setStartsOn(event.target.value)}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Ends on
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal"
                type="date"
                value={endsOn}
                onChange={(event) => setEndsOn(event.target.value)}
                required
              />
            </label>

            <div className="sm:col-span-2">
              <button
                className="rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white"
                type="submit"
              >
                Save goal
              </button>
              {message && <p className="mt-3 text-sm text-stone-600">{message}</p>}
            </div>
          </form>
        </section>

        <p className="text-xs text-stone-500">
          Progress is sample data until linked to your ledger. Repayments and account transfers won’t count as income.
        </p>
      </div>
    </main>
  );
}