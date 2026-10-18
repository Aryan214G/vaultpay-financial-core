import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request) {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    let query = adminDb.collection("invoices");

    if (authResult.role === "client") {
      query = query.where("clientId", "==", authResult.uid);
    }

    const snapshot = await query.get();

    const invoices = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Failed to fetch invoices:", error.message);

    return NextResponse.json(
      { error: "Unable to fetch invoices." },
      { status: 500 }
    );
  }
}
