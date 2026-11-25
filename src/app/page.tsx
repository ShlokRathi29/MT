import { AppHeader } from "@/components/app-header";

const activity = [
  { date: "Nov 22", description: "Freelance payment", category: "Income", amount: "+$1,200.00", positive: true },
  { date: "Nov 21", description: "Rent payment", category: "Housing", amount: "-$1,500.00", positive: false },
  { date: "Nov 20", description: "Groceries", category: "Food", amount: "-$85.20", positive: false },
  { date: "Nov 18", description: "Lent to Mentos · chocolate", category: "Lending", amount: "-$100.00", positive: false },
];

const debts = [
  { name: "Lent to Mentos", date: "Dec 15, 2026", amount: "$250.00", kind: "To receive" },
  { name: "Borrowed from Alex", date: "Dec 18, 2026", amount: "$100.00", kind: "To repay" },
];

const netWorthItems = [
  { name: "Cash accounts", amount: "$15,000.00", color: "bg-emerald-700" },
  { name: "Investments", amount: "$18,400.00", color: "bg-emerald-500" },
  { name: "Money lent", amount: "$9,450.00", color: "bg-emerald-300" },
  { name: "Money borrowed", amount: "-$300.00", color: "bg-rose-400" },
];



export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f3] text-stone-900">
      <AppHeader active="Dashboard" />

      <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-7 lg:px-8">
        <section aria-label="Financial summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Net worth" value="$42,550.00" detail="Across your tracked accounts" />
          <SummaryCard label="Monthly cash flow" value="+$1,840.00" detail="Income minus expenses" positive />
          <SummaryCard label="Investments" value="$18,400.00" detail="Manually tracked current value" />
          <SummaryCard label="Open debt" value="$350.00" detail="$250 to receive · $100 to repay" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_1.6fr_1.1fr]">
          <Panel title="Income goal" subtitle="Monthly target">
            <div className="mt-6 flex items-end justify-between">
              <span className="text-4xl font-semibold tracking-tight">86.7%</span>
              <span className="text-sm text-stone-500">$5,200 of $6,000</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full w-[86.7%] rounded-full bg-emerald-800" />
            </div>
            <p className="mt-4 text-sm text-stone-500">You’re $800 away from this month’s goal.</p>
          </Panel>

          <Panel title="Cash flow" subtitle="Last 3 months">
            <div className="mt-5 flex h-44 items-end justify-around gap-5 border-b border-stone-200 px-2">
              <ChartBar month="Sep" value="−$1,300" height="35%" color="bg-stone-300" />
              <ChartBar month="Oct" value="+$950" height="58%" color="bg-emerald-500" />
              <ChartBar month="Nov" value="+$1,840" height="85%" color="bg-emerald-900" />
            </div>
          </Panel>

          <Panel title="Net worth breakdown" subtitle="Current tracked balances">
            <div className="mt-5 space-y-4">
              {netWorthItems.map((item) => (
                <div className="flex items-center justify-between gap-3" key={item.name}>
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <span className={`size-3 rounded-sm ${item.color}`} />
                    {item.name}
                  </div>
                  <span className="text-sm font-medium">{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-stone-200 pt-4 font-semibold">
                <span>Total</span>
                <span>$42,550.00</span>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <Panel title="Recent activity" subtitle="Your latest money records">
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-stone-400">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Description</th>
                    <th className="py-3 pr-4 font-medium">Category</th>
                    <th className="py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((item) => (
                    <tr className="border-t border-stone-100" key={item.description}>
                      <td className="py-4 pr-4 text-stone-500">{item.date}</td>
                      <td className="py-4 pr-4 font-medium">{item.description}</td>
                      <td className="py-4 pr-4 text-stone-500">{item.category}</td>
                      <td className={`py-4 text-right font-semibold ${item.positive ? "text-emerald-800" : "text-stone-700"}`}>
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Upcoming debts" subtitle="Dates and amounts to keep in view">
            <div className="mt-4 divide-y divide-stone-100">
              {debts.map((debt) => (
                <div className="flex items-center justify-between gap-3 py-4" key={debt.name}>
                  <div>
                    <p className="font-medium">{debt.name}</p>
                    <p className="mt-1 text-sm text-stone-500">{debt.kind} · {debt.date}</p>
                  </div>
                  <span className="font-semibold">{debt.amount}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-950">
              These are sample figures. Later, this panel will use your saved records.
            </p>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  positive = false,
}: {
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${positive ? "text-emerald-800" : ""}`}>
        {value}
      </p>
      <p className="mt-2 text-xs text-stone-400">{detail}</p>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ChartBar({
  month,
  value,
  height,
  color,
}: {
  month: string;
  value: string;
  height: string;
  color: string;
}) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-end gap-2">
      <span className="text-xs text-stone-500">{value}</span>
      <div className={`w-full max-w-20 rounded-t-lg ${color}`} style={{ height }} />
      <span className="text-xs text-stone-500">{month}</span>
    </div>
  );
}