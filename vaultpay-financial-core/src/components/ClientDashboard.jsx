const invoices = [
  {
    id: "INV-2026-001",
    description: "Enterprise Strategy Services",
    amount: 24500,
    status: "Pending",
    dueDate: "Oct 25, 2026",
  },
  {
    id: "INV-2026-005",
    description: "Annual Advisory Retainer",
    amount: 8500,
    status: "Paid",
    dueDate: "Oct 5, 2026",
  },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ClientDashboard() {
  const outstanding = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((total, invoice) => total + invoice.amount, 0);

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          VaultPay
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          My invoices
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          View your billing history and outstanding payments.
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">
            Outstanding balance
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {formatCurrency(outstanding)}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {invoices.filter((invoice) => invoice.status !== "Paid").length} invoice awaiting payment
          </p>
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-6 py-5">
            <h2 className="font-semibold">Billing history</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Your invoices and payment status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Due date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-blue-700">
                        {invoice.id}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {invoice.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">{invoice.dueDate}</td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.status === "Pending" ? (
                        <button
                          type="button"
                          disabled
                          title="Payment will be enabled after Stripe integration"
                          className="cursor-not-allowed rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-400"
                        >
                          Pay invoice
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Payment complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-5 text-xs text-zinc-400">
          Prototype preview · Sample invoices only
        </p>
      </div>
    </main>
  );
}
