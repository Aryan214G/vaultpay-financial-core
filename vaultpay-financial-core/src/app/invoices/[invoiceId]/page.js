"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function InvoiceDetailContent() {
  const { invoiceId } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function fetchInvoice(user) {
      try {
        setLoading(true);
        setError("");

        const token = await user.getIdToken();

        const response = await fetch(
          `/api/invoices/${encodeURIComponent(invoiceId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load invoice.");
        }

        if (active) {
          setInvoice(data.invoice);
        }
      } catch (error) {
        if (active) {
          setError(error.message || "Unable to load invoice.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (!invoiceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      setError("Invoice ID is missing.");
    } else {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!active) return;

        if (!user) {
          setInvoice(null);
          setError("Please sign in to view this invoice.");
          setLoading(false);
          return;
        }

        fetchInvoice(user);
      });
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [invoiceId]);

  return (
    <main className="min-h-screen bg-[#f6f7f9] px-6 py-8 text-zinc-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to dashboard
        </Link>

        <h1 className="mt-6 text-2xl font-semibold">Invoice details</h1>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-500">Loading invoice...</p>
        ) : error ? (
          <section className="mt-6 rounded-xl border border-red-200 bg-white p-6">
            <h2 className="font-semibold text-red-700">
              Unable to display invoice
            </h2>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>
          </section>
        ) : invoice ? (
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-6">
              <div>
                <p className="text-sm text-zinc-500">Invoice number</p>
                <h2 className="mt-1 text-xl font-semibold">
                  {invoice.invoiceNumber || invoice.id}
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {invoice.description}
                </p>
              </div>

              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                {invoice.status}
              </span>
            </div>

            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">Amount due</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {formatCurrency(invoice.amount)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-zinc-500">Due date</dt>
                <dd className="mt-1 font-medium">{invoice.dueDate}</dd>
              </div>

              <div>
                <dt className="text-sm text-zinc-500">Created</dt>
                <dd className="mt-1 font-medium">
                  {invoice.createdAt
                    ? new Date(invoice.createdAt).toLocaleDateString()
                    : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-zinc-500">Billed to</dt>
                <dd className="mt-1 font-medium">
                  {invoice.clientEmail || "—"}
                </dd>
              </div>
            </dl>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default function InvoiceDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] text-sm text-zinc-500">
          Loading invoice...
        </main>
      }
    >
      <InvoiceDetailContent />
    </Suspense>
  );
}
