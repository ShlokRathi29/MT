"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";

type Account = {
  id: number;
  name: string;
  kind: "Cash" | "Bank";
  openingBalanceMinor: number;
};

const initialAccounts: Account[] = [
  { id: 1, name: "Everyday checking", kind: "Bank", openingBalanceMinor: 1250000 },
  { id: 2, name: "Savings", kind: "Bank", openingBalanceMinor: 200000 },
  { id: 3, name: "Cash wallet", kind: "Cash", openingBalanceMinor: 50000 },
];

function money(amountMinor: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountMinor / 100);
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"Cash" | "Bank">("Bank");
  const [openingBalance, setOpeningBalance] = useState("");
  const [message, setMessage] = useState("");

  const totalBalance = useMemo(
    () => accounts.reduce((total, account) => total + account.openingBalanceMinor, 0),
    [accounts],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(openingBalance);
    if (!name.trim() || !Number.isFinite(amount) || amount < 0) {
      setMessage("Enter an account name and a valid opening balance.");
      return;
    }

    setAccounts((current) => [
      ...current,
      {
        id: Date.now(),
        name: name.trim(),
        kind,
        openingBalanceMinor: Math.round(amount * 100),
      },
    ]);
    setName("");
    setOpeningBalance("");
    setMessage("Account added for this session. Saving it permanently comes with database setup.");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Accounts" />

      <div className="mx-auto max-w-[1200px] space-y-6 px-5 py-7 lg:px-8">
        <div>
          <p className="text-sm font-medium text-emerald-800">Your money locations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-2 text-sm text-stone-500">
            Manually track cash and bank balances. No bank connection is used.
          </p>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">Total tracked balance</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{money(totalBalance)}</p>
          <p className="mt-2 text-xs text-stone-400">
            Current balances equal opening balances until ledger activity is connected.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <article
              key={account.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                    {account.kind} account
                  </p>
                  <h2 className="mt-2 font-semibold">{account.name}</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-900">
                  Active
                </span>
              </div>
              <p className="mt-6 text-2xl font-semibold">{money(account.openingBalanceMinor)}</p>
              <p className="mt-1 text-sm text-stone-500">Opening balance</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-semibold">Add an account</h2>
          <p className="mt-1 text-sm text-stone-500">
            Enter the balance you want the tracker to start from.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Account name
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-800"
                placeholder="e.g. Main bank account"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="text-sm font-medium">
              Account type
              <select
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-800"
                value={kind}
                onChange={(event) => setKind(event.target.value as "Cash" | "Bank")}
              >
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
              </select>
            </label>

            <label className="text-sm font-medium sm:col-span-2">
              Opening balance (USD)
              <input
                className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 font-normal outline-none focus:border-emerald-800 sm:max-w-sm"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={openingBalance}
                onChange={(event) => setOpeningBalance(event.target.value)}
                required
              />
            </label>

            <div className="sm:col-span-2">
              <button
                className="rounded-xl bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                type="submit"
              >
                Add account
              </button>
              {message && <p className="mt-3 text-sm text-stone-600">{message}</p>}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}