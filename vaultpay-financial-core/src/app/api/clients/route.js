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

  if (authResult.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can access the client list." },
      { status: 403 }
    );
  }

  try {
    const snapshot = await adminDb
      .collection("users")
      .where("role", "==", "client")
      .get();

    const clients = snapshot.docs.map((document) => {
      const data = document.data();

      return {
        uid: document.id,
        name: data.name ?? "",
        email: data.email ?? "",
      };
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Failed to fetch clients:", error.message);

    return NextResponse.json(
      { error: "Unable to fetch clients." },
      { status: 500 }
    );
  }
}
