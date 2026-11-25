import Link from "next/link";

export function AppHeader({ active }: { active: "Dashboard" | "Ledger" }) {
  const items = [
    { label: "Dashboard", href: "/" },
    { label: "Ledger", href: "/ledger" },
    { label: "Accounts", href: "/accounts" },
    { label: "Investments", href: "/investments" },
    { label: "Lending & Borrowing", href: "/debts" },
  ] as const;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link className="text-xl font-bold tracking-tight" href="/">
            Money <span className="text-emerald-900">Tracker</span>
          </Link>

          <nav className="flex gap-5 text-sm" aria-label="Main navigation">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active === item.label ? "page" : undefined}
                className={
                  active === item.label
                    ? "font-semibold text-emerald-950"
                    : "text-stone-500 hover:text-stone-900"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium">
            ‹　Nov 2026　›
          </button>
          <button className="rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white">
            + Add Entry
          </button>
          <div className="grid size-10 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-950">
            S
          </div>
        </div>
      </div>
    </header>
  );
}