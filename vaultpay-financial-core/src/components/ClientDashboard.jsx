"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ClientDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState("");

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoadingInvoices(true);
        setInvoiceError("");

        const currentUser = auth.currentUser;

        if (!currentUser) {
          setInvoiceError("Please sign in to view your invoices.");
          return;
        }

        const token = await currentUser.getIdToken();

        const response = await fetch("/api/invoices", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch invoices.");
        }

        setInvoices(data.invoices);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        setInvoiceError(error.message || "Unable to load invoices.");
      } finally {
        setLoadingInvoices(false);
      }
    }

    fetchInvoices();
  }, []);

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
                {loadingInvoices ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoiceError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-red-600">
                      {invoiceError}
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                      You don&apos;t have any invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-blue-700">
                          {invoice.invoiceNumber || invoice.id}
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
                              : invoice.status === "Overdue"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <a
                            href={`/invoices/${encodeURIComponent(invoice.id)}`}
                            className="text-xs font-medium text-blue-700 hover:underline"
                          >
                            View invoice
                          </a>

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
                              {invoice.status === "Paid"
                                ? "Payment complete"
                                : "Payment overdue"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-5 text-xs text-zinc-400">
          Live invoice data · Online payments are not yet enabled
        </p>
      </div>
    </main>
  );
}
