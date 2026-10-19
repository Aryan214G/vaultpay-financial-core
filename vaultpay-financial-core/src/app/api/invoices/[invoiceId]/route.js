import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/require-auth";

export async function GET(request, { params }) {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { invoiceId } = await params;

  try {
    const invoiceDoc = await adminDb
      .collection("invoices")
      .doc(invoiceId)
      .get();

    if (!invoiceDoc.exists) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    const invoice = {
      id: invoiceDoc.id,
      ...invoiceDoc.data(),
    };

    if (
      authResult.role === "client" &&
      invoice.clientId !== authResult.uid
    ) {
      return NextResponse.json(
        { error: "You do not have permission to view this invoice." },
        { status: 403 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);

    return NextResponse.json(
      { error: "Failed to fetch invoice." },
      { status: 500 }
    );
  }
}
