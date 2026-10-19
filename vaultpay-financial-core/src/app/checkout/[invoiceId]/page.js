"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function CheckoutPage() {
  const { invoiceId } = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("Please sign in to continue.");
        setLoading(false);
        return;
      }

      try {
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

        if (data.invoice.status !== "Pending") {
          throw new Error("Only pending invoices can be checked out.");
        }

        setInvoice(data.invoice);
      } catch (err) {
        setError(err.message || "Unable to load invoice.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [invoiceId]);

  async function handleCheckout() {
    if (checkoutLoading || !invoice) return;

    setCheckoutLoading(true);
    setError("");

    // Demo mode only: no payment is processed and no invoice status changes.
    await new Promise((resolve) => setTimeout(resolve, 800));

    setCheckoutLoading(false);
    setError(
      "Demo mode: payment processing is not configured yet. No payment was taken."
    );
  }

  if (loading) {
    return <main className="p-8 text-zinc-600">Loading checkout...</main>;
  }

  if (!invoice) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-xl font-semibold text-zinc-900">
          Checkout unavailable
        </h1>
        <p className="mt-3 text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-5 text-sm font-medium text-blue-700 hover:underline"
        >
          Back to dashboard
        </button>
      </main>
    );
  }

  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(invoice.amount);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12">
      <section className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-blue-700">VaultPay</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          Invoice checkout
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Review your invoice before continuing.
        </p>

        <div className="mt-8 space-y-4 border-y border-zinc-200 py-6">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-zinc-500">Invoice</span>
            <span className="text-sm font-medium text-zinc-900">
              {invoice.invoiceNumber || invoice.id}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-zinc-500">Description</span>
            <span className="text-right text-sm text-zinc-900">
              {invoice.description}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-zinc-500">Due date</span>
            <span className="text-sm text-zinc-900">{invoice.dueDate}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-sm text-zinc-500">Amount due</span>
            <span className="text-lg font-semibold text-zinc-900">
              {amount}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            Demo checkout
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Online payments are not configured yet. This demo will not charge
            you or mark the invoice as paid.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checkoutLoading ? "Preparing checkout..." : `Continue to payment · ${amount}`}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push(`/invoices/${encodeURIComponent(invoice.id)}`)}
          className="mt-4 w-full text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          Back to invoice
        </button>
      </section>
    </main>
  );
}
