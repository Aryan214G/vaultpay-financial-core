"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

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

export default function AdminDashboard({ profile }) {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState("");

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [invoiceFormError, setInvoiceFormError] = useState("");
  const [invoiceFormSuccess, setInvoiceFormSuccess] = useState("");

  const [invoiceForm, setInvoiceForm] = useState({
    clientId: "",
    invoiceNumber: "",
    description: "",
    amount: "",
    dueDate: "",
  });

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoadingInvoices(true);
        setInvoiceError("");

        const currentUser = auth.currentUser;

        if (!currentUser) {
          setInvoiceError("Please sign in to view invoices.");
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

        const clientsResponse = await fetch("/api/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const clientsData = await clientsResponse.json();

        if (!clientsResponse.ok) {
          throw new Error(
            clientsData.error || "Failed to fetch clients."
          );
        }

        setClients(clientsData.clients);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        setInvoiceError(error.message || "Unable to load invoices.");
      } finally {
        setLoadingInvoices(false);
      }
    }

    fetchInvoices();
  }, []);

  async function handleCreateInvoice(event) {
    event.preventDefault();

    setInvoiceFormError("");
    setInvoiceFormSuccess("");

    const amount = Number(invoiceForm.amount);

    if (
      !invoiceForm.clientId ||
      !invoiceForm.invoiceNumber.trim() ||
      !invoiceForm.description.trim() ||
      !invoiceForm.dueDate ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setInvoiceFormError("Please complete all fields with valid values.");
      return;
    }

    try {
      setSubmittingInvoice(true);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please sign in before creating an invoice.");
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: invoiceForm.clientId,
          invoiceNumber: invoiceForm.invoiceNumber.trim(),
          description: invoiceForm.description.trim(),
          amount,
          dueDate: invoiceForm.dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice.");
      }

      setInvoices((currentInvoices) => [
        data.invoice,
        ...currentInvoices,
      ]);

      setInvoiceForm({
        clientId: "",
        invoiceNumber: "",
        description: "",
        amount: "",
        dueDate: "",
      });

      setInvoiceFormSuccess("Invoice created successfully.");
    } catch (error) {
      console.error("Failed to create invoice:", error);
      setInvoiceFormError(error.message || "Unable to create invoice.");
    } finally {
      setSubmittingInvoice(false);
    }
  }

  const displayName = profile?.name?.trim() || "Admin";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

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
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-zinc-500">
                {profile?.role?.toLowerCase() === "admin" ? "Administrator" : "Client"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {initials}
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
              onClick={() => {
                setShowInvoiceForm((visible) => !visible);
                setInvoiceFormError("");
                setInvoiceFormSuccess("");
              }}
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800"
            >
              {showInvoiceForm ? "Cancel" : "+ Create invoice"}
            </button>
          </div>

          {showInvoiceForm && (
            <form
              onSubmit={handleCreateInvoice}
              className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200/30 sm:p-6"
            >
              <div className="mb-5">
                <h3 className="font-semibold">Create a new invoice</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Enter the billing details and select the client.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="invoice-client"
                    className="mb-1.5 block text-sm font-medium text-zinc-700"
                  >
                    Client
                  </label>
                  <select
                    id="invoice-client"
                    required
                    value={invoiceForm.clientId}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({
                        ...current,
                        clientId: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.uid} value={client.uid}>
                        {client.name || client.email} ({client.email})
                      </option>
                    ))}
                  </select>
                  {clients.length === 0 && (
                    <p className="mt-1.5 text-xs text-zinc-500">
                      No clients are available to select.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="invoice-number"
                    className="mb-1.5 block text-sm font-medium text-zinc-700"
                  >
                    Invoice number
                  </label>
                  <input
                    id="invoice-number"
                    required
                    value={invoiceForm.invoiceNumber}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({
                        ...current,
                        invoiceNumber: event.target.value,
                      }))
                    }
                    placeholder="INV-2026-005"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="invoice-description"
                    className="mb-1.5 block text-sm font-medium text-zinc-700"
                  >
                    Description
                  </label>
                  <input
                    id="invoice-description"
                    required
                    value={invoiceForm.description}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Consulting services"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invoice-amount"
                    className="mb-1.5 block text-sm font-medium text-zinc-700"
                  >
                    Amount (USD)
                  </label>
                  <input
                    id="invoice-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={invoiceForm.amount}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="2500.00"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="invoice-due-date"
                    className="mb-1.5 block text-sm font-medium text-zinc-700"
                  >
                    Due date
                  </label>
                  <input
                    id="invoice-due-date"
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {invoiceFormError && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {invoiceFormError}
                </p>
              )}

              {invoiceFormSuccess && (
                <p role="status" className="mt-4 text-sm text-emerald-700">
                  {invoiceFormSuccess}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={submittingInvoice}
                  onClick={() => {
                    setShowInvoiceForm(false);
                    setInvoiceFormError("");
                    setInvoiceFormSuccess("");
                  }}
                  className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingInvoice || clients.length === 0}
                  className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingInvoice ? "Creating..." : "Create invoice"}
                </button>
              </div>
            </form>
          )}

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
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-zinc-500">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : invoiceError ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-red-600">
                        {invoiceError}
                      </td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-zinc-500">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-zinc-50/70">
                        <td className="px-5 py-4">
                          <p className="font-medium text-blue-700">
                            {invoice.invoiceNumber || invoice.id}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {invoice.description}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {clients.find((client) => client.uid === invoice.clientId)?.name ||
                            invoice.clientEmail ||
                            invoice.clientId}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-5 text-xs text-zinc-400">
            Live invoice data · Payments are not yet enabled
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
