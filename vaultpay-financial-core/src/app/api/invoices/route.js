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

export async function POST(request) {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  if (authResult.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can create invoices." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const {
      clientId,
      invoiceNumber,
      description,
      amount,
      dueDate,
    } = body;

    if (
      typeof clientId !== "string" ||
      !clientId.trim() ||
      typeof invoiceNumber !== "string" ||
      !invoiceNumber.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof dueDate !== "string" ||
      !dueDate.trim() ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "Please provide valid invoice details." },
        { status: 400 }
      );
    }

    const clientRef = adminDb.collection("users").doc(clientId);
    const clientSnapshot = await clientRef.get();

    if (!clientSnapshot.exists) {
      return NextResponse.json(
        { error: "The selected client does not exist." },
        { status: 400 }
      );
    }

    const client = clientSnapshot.data();

    if (client.role?.toLowerCase() !== "client") {
      return NextResponse.json(
        { error: "Invoices can only be assigned to clients." },
        { status: 400 }
      );
    }

    const invoice = {
      clientId,
      clientEmail: client.email,
      invoiceNumber: invoiceNumber.trim(),
      description: description.trim(),
      amount,
      dueDate,
      status: "Pending",
      createdAt: new Date().toISOString(),
      createdBy: authResult.uid,
    };

    const invoiceRef = await adminDb
      .collection("invoices")
      .add(invoice);

    return NextResponse.json(
      {
        message: "Invoice created successfully.",
        invoice: {
          id: invoiceRef.id,
          ...invoice,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create invoice:", error.message);

    return NextResponse.json(
      { error: "Unable to create invoice." },
      { status: 500 }
    );
  }
}
