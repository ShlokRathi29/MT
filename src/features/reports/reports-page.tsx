"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { AppHeader } from "@/components/app-header";

type EntryType = "Income" | "Expense" | "Transfer" | "Lent" | "Repayment";

type Row = {
  id: number;
  date: string;
  type: EntryType;
  description: string;
  category: string;
  amountMinor: number;
  account: string;
};

const sampleRows: Row[] = [
  { id: 1, date: "2026-09-04", type: "Income", description: "Design work", category: "Work", amountMinor: 320000, account: "Checking" },
  { id: 2, date: "2026-09-08", type: "Expense", description: "Rent", category: "Housing", amountMinor: 150000, account: "Checking" },
  { id: 3, date: "2026-10-02", type: "Income", description: "Salary", category: "Work", amountMinor: 380000, account: "Checking" },
  { id: 4, date: "2026-10-12", type: "Expense", description: "Groceries", category: "Food", amountMinor: 62500, account: "Checking" },
  { id: 5, date: "2026-11-01", type: "Income", description: "Salary", category: "Work", amountMinor: 420000, account: "Checking" },
  { id: 6, date: "2026-11-07", type: "Expense", description: "Rent", category: "Housing", amountMinor: 150000, account: "Checking" },
  { id: 7, date: "2026-11-14", type: "Expense", description: "Groceries", category: "Food", amountMinor: 42000, account: "Checking" },
  { id: 8, date: "2026-11-18", type: "Lent", description: "Lent to Mentos", category: "Personal", amountMinor: 10000, account: "Checking" },
  { id: 9, date: "2026-11-22", type: "Repayment", description: "Repayment from Mentos", category: "Debt repayment", amountMinor: 4000, account: "Checking" },
];

const acceptedTypes: EntryType[] = ["Income", "Expense", "Transfer", "Lent", "Repayment"];

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

function parseCsv(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field.replace(/\r$/, ""));
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function csvCell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && /^[\s]*[=+\-@]/.test(value)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export default function ReportsPage() {
  const [from, setFrom] = useState("2026-09-01");
  const [to, setTo] = useState("2026-11-30");
  const [preview, setPreview] = useState<{ valid: number; errors: string[] } | null>(null);
  const [importMessage, setImportMessage] = useState("");

  const filteredRows = useMemo(
    () => sampleRows.filter((row) => row.date >= from && row.date <= to),
    [from, to],
  );

  const totals = useMemo(() => {
    const income = filteredRows
      .filter((row) => row.type === "Income")
      .reduce((sum, row) => sum + row.amountMinor, 0);
    const expenses = filteredRows
      .filter((row) => row.type === "Expense")
      .reduce((sum, row) => sum + row.amountMinor, 0);
    return { income, expenses, cashFlow: income - expenses };
  }, [filteredRows]);

  const categories = useMemo(() => {
    const sums = new Map<string, number>();
    for (const row of filteredRows.filter((item) => item.type === "Expense")) {
      sums.set(row.category, (sums.get(row.category) ?? 0) + row.amountMinor);
    }
    return [...sums.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredRows]);

  const monthlyCashFlow = useMemo(() => {
    const sums = new Map<string, number>();
    for (const row of filteredRows) {
      const month = row.date.slice(0, 7);
      if (row.type === "Income") sums.set(month, (sums.get(month) ?? 0) + row.amountMinor);
      if (row.type === "Expense") sums.set(month, (sums.get(month) ?? 0) - row.amountMinor);
    }
    return [...sums.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRows]);

  function exportCsv() {
    const header = ["date", "type", "description", "category", "amount", "account"];
    const body = filteredRows.map((row) => [
      row.date,
      row.type,
      row.description,
      row.category,
      (row.amountMinor / 100).toFixed(2),
      row.account,
    ]);
    const csv = [header, ...body].map((line) => line.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "money-tracker-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function previewCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(null);
    setImportMessage("");
    if (!file) return;

    if (file.size > 2_000_000) {
      setImportMessage("Choose a CSV file smaller than 2 MB.");
      return;
    }

    const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
    if (rows.length < 2) {
      setImportMessage("The file needs a header row and at least one record.");
      return;
    }
    if (rows.length > 5001) {
      setImportMessage("This preview is limited to 5,000 records at a time.");
      return;
    }

    const headers = rows[0].map((cell) => cell.trim().toLowerCase());
    const required = ["date", "type", "description", "amount"];
    const missing = required.filter((header) => !headers.includes(header));

    if (missing.length) {
      setImportMessage(`Missing required CSV columns: ${missing.join(", ")}.`);
      return;
    }

    const index = (name: string) => headers.indexOf(name);
    const errors: string[] = [];
    let valid = 0;

    rows.slice(1).forEach((cells, rowIndex) => {
      const line = rowIndex + 2;
      const date = cells[index("date")]?.trim() ?? "";
      const type = cells[index("type")]?.trim() as EntryType;
      const description = cells[index("description")]?.trim() ?? "";
      const amount = parseMinor(cells[index("amount")] ?? "");

      const validDate =
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        !Number.isNaN(Date.parse(`${date}T12:00:00`));

      if (!validDate) errors.push(`Row ${line}: date must use YYYY-MM-DD.`);
      if (!acceptedTypes.includes(type)) errors.push(`Row ${line}: unsupported type.`);
      if (!description) errors.push(`Row ${line}: description is required.`);
      if (amount === null || amount <= 0) errors.push(`Row ${line}: amount must be positive with at most 2 decimals.`);

      if (validDate && acceptedTypes.includes(type) && description && amount !== null && amount > 0) {
        valid++;
      }
    });

    setPreview({ valid, errors: errors.slice(0, 10) });
  }

  const maxBar = Math.max(1, ...monthlyCashFlow.map(([, amount]) => Math.abs(amount)));

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Reports" />

      <div className="mx-auto max-w-[1200px] space-y-6 px-5 py-7 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-800">Understand your activity</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Reports</h1>
            <p className="mt-2 text-sm text-stone-500">
              Income and expenses only; transfers and debt repayments are kept separate.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Export filtered CSV
          </button>
        </div>

        <section className="flex flex-wrap items-end gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-medium">
            From
            <input className="mt-2 block rounded-xl border border-stone-300 px-3 py-2" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-sm font-medium">
            To
            <input className="mt-2 block rounded-xl border border-stone-300 px-3 py-2" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Summary label="Income" value={money(totals.income)} />
          <Summary label="Expenses" value={money(totals.expenses)} />
          <Summary label="Cash flow" value={money(totals.cashFlow)} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Monthly cash flow</h2>
            <div className="mt-5 flex min-h-56 items-end gap-4 border-b border-stone-200 pb-3">
              {monthlyCashFlow.map(([month, amount]) => (
                <div className="flex flex-1 flex-col items-center gap-2" key={month}>
                  <span className="text-xs text-stone-500">{money(amount)}</span>
                  <div
                    className={`w-full max-w-24 rounded-t-lg ${amount >= 0 ? "bg-emerald-800" : "bg-rose-400"}`}
                    style={{ height: `${Math.max(12, (Math.abs(amount) / maxBar) * 130)}px` }}
                  />
                  <span className="text-xs text-stone-500">{month}</span>
                </div>
              ))}
              {monthlyCashFlow.length === 0 && (
                <p className="m-auto text-sm text-stone-500">No income or expense records in this range.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Expense categories</h2>
            <div className="mt-4 divide-y divide-stone-100">
              {categories.map(([category, amount]) => (
                <div className="flex justify-between py-4 text-sm" key={category}>
                  <span className="text-stone-600">{category}</span>
                  <span className="font-semibold">{money(amount)}</span>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="py-8 text-sm text-stone-500">No expenses in this date range.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Import CSV</h2>
          <p className="mt-1 text-sm text-stone-500">
            Preview rows using columns: date, type, description, amount. Optional: category, account.
          </p>
          <input
            className="mt-4 block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:font-medium file:text-emerald-950"
            type="file"
            accept=".csv,text/csv"
            onChange={previewCsv}
          />
          {importMessage && <p className="mt-3 text-sm text-rose-700">{importMessage}</p>}
          {preview && (
            <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm">
              <p>{preview.valid} valid row(s) found. Importing into the ledger will be connected with database persistence.</p>
              {preview.errors.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-rose-700">
                  {preview.errors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              )}
            </div>
          )}
        </section>

        <p className="text-xs text-stone-500">
          This page uses sample records. Export works for the sample data; import currently validates and previews only.
        </p>
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