"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import AdminDashboard from "@/components/AdminDashboard";

export default function AdminDashboardPage() {
  const [status, setStatus] = useState("checking");
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.testInvoice = async (invoiceId) => {
        if (!auth.currentUser) {
          console.error("No user signed in.");
          return;
        }
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`/api/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("HTTP status:", res.status);
        console.log("Response:", data);
        return { status: res.status, data };
      };
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setProfile(null);

      if (!user) {
        setEmail("");
        setStatus("unauthenticated");
        return;
      }

      setEmail(user.email || "");
      setStatus("checking");

      try {
        const profileSnapshot = await getDoc(
          doc(db, "users", user.uid)
        );

        if (!profileSnapshot.exists()) {
          setStatus("forbidden");
          return;
        }

        const profileData = profileSnapshot.data();

        if (profileData.role?.toLowerCase() !== "admin") {
          setStatus("forbidden");
          return;
        }

        setProfile(profileData);
        setStatus("authorized");
      } catch (error) {
        console.error("Admin authorization check failed:", error);
        setStatus("error");
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleSignOut() {
    await signOut(auth);
  }

  if (status === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Checking admin access...
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        You must sign in before accessing this page.
      </main>
    );
  }

  if (status === "forbidden") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <section className="rounded-xl border border-zinc-200 p-8">
          <h1 className="text-xl font-semibold">403 — Forbidden</h1>
          <p className="mt-2 text-sm text-zinc-600">
            You do not have permission to access the admin dashboard.
          </p>
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Unable to verify your admin access. Please try again.
      </main>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <span className="text-sm text-zinc-600">
          Signed in as {email} · admin
        </span>

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Sign out
        </button>
      </div>

      <AdminDashboard profile={profile} />
    </>
  );
}
