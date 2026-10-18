const invoices = [
  {
    id: "INV-2026-001",
    client: "Northstar Consulting",
    description: "Enterprise Strategy Services",
    amount: 24500,
    status: "Pending",
    dueDate: "Oct 25, 2026",
  },
  {
    id: "INV-2026-002",
    client: "Vertex Solutions",
    description: "Technical Advisory",
    amount: 12500,
    status: "Paid",
    dueDate: "Oct 12, 2026",
  },
  {
    id: "INV-2026-003",
    client: "Meridian Group",
    description: "Infrastructure Assessment",
    amount: 38000,
    status: "Pending",
    dueDate: "Oct 30, 2026",
  },
  {
    id: "INV-2026-004",
    client: "Apex Industries",
    description: "Quarterly Consulting Retainer",
    amount: 18000,
    status: "Overdue",
    dueDate: "Oct 10, 2026",
  },
];

function StatusBadge({ status }) {
  const styles = {
    Paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Overdue: "bg-red-50 text-red-700 ring-red-600/20",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Home() {
  const totalInvoiced = invoices.reduce(
    (total, invoice) => total + invoice.amount,
    0
  );

  const paidAmount = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((total, invoice) => total + invoice.amount, 0);

  const outstanding = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + invoice.amount, 0);

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-zinc-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-zinc-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
            V
          </div>
          <div>
            <p className="font-semibold tracking-tight">VaultPay</p>
            <p className="text-xs text-zinc-500">Financial Core</p>
          </div>
        </div>

        <nav className="space-y-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Workspace
          </p>

          <a
            href="#overview"
            className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"
          >
            <span>▦</span>
            Overview
          </a>

          <a
            href="#invoices"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            <span>▤</span>
            Invoices
          </a>

          <a
            href="#clients"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            <span>♙</span>
            Clients
          </a>
        </nav>

        <div className="absolute inset-x-4 bottom-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-medium">Secure workspace</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Corporate billing and invoice management.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-6 sm:px-8">
          <div>
            <p className="text-sm text-zinc-500">Workspace / Overview</p>
            <h1 className="mt-1 text-lg font-semibold">
              Financial overview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">Alex Morgan</p>
              <p className="text-xs text-zinc-500">Administrator</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              AM
            </div>
          </div>
        </header>

        <div id="overview" className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Good morning, Alex
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Here&apos;s what&apos;s happening with your invoices.
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
            >
              + Create invoice
            </button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total invoiced"
              value={formatCurrency(totalInvoiced)}
              detail="Across all sample invoices"
            />
            <MetricCard
              label="Payments received"
              value={formatCurrency(paidAmount)}
              detail="Successfully paid invoices"
            />
            <MetricCard
              label="Outstanding"
              value={formatCurrency(outstanding)}
              detail="Awaiting payment"
            />
            <MetricCard
              label="Total invoices"
              value={String(invoices.length)}
              detail="Across all clients"
            />
          </section>

          <section
            id="invoices"
            className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200/30"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold">Recent invoices</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Track billing and payment status.
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium hover:bg-zinc-50"
              >
                View all invoices
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Invoice</th>
                    <th className="px-5 py-3.5 font-medium">Client</th>
                    <th className="px-5 py-3.5 font-medium">Amount</th>
                    <th className="px-5 py-3.5 font-medium">Due date</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-50/70">
                      <td className="px-5 py-4">
                        <p className="font-medium text-blue-700">
                          {invoice.id}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {invoice.description}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-medium">
                        {invoice.client}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-zinc-600">
                        {invoice.dueDate}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-5 text-xs text-zinc-400">
            Prototype preview · Sample data only · No real payments are enabled
          </p>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/30">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-zinc-400">{detail}</p>
    </div>
  );
}
