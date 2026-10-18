import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";

export const runtime = "nodejs";

export async function GET(request) {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  return NextResponse.json({
    uid: authResult.uid,
    email: authResult.email,
    role: authResult.role,
  });
}
