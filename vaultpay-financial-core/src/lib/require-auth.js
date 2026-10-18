import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function requireAuth(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: "Missing or invalid authorization token.",
      status: 401,
    };
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return {
      error: "Missing or invalid authorization token.",
      status: 401,
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    const userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      return {
        error: "User profile not found.",
        status: 403,
      };
    }

    const profile = userDoc.data();
    const role = profile.role?.toLowerCase();

    if (role !== "admin" && role !== "client") {
      return {
        error: "User role is not authorized.",
        status: 403,
      };
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      role,
      profile,
    };
  } catch (error) {
    console.error("Authentication failed:", error.message);

    return {
      error: "Invalid or expired authentication token.",
      status: 401,
    };
  }
}
