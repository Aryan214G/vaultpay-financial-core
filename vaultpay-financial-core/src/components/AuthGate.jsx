"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import AuthForm from "@/components/AuthForm";
import AdminDashboard from "@/components/AdminDashboard";
import ClientDashboard from "@/components/ClientDashboard";

export default function AuthGate() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      setUser(currentUser);
      setRole(null);
      setProfile(null);
      setError("");

      if (!currentUser) {
        setChecking(false);
        return;
      }

      setChecking(true);

      try {
        const profile = await getDoc(
          doc(db, "users", currentUser.uid)
        );

        if (!active) return;

        if (!profile.exists()) {
          setError("Your user profile has not been configured.");
        } else {
          const profileData = profile.data();
          const userRole = profileData.role?.toLowerCase();

          if (userRole === "admin" || userRole === "client") {
            setRole(userRole);
            setProfile(profileData);
          } else {
            setError("Your account does not have a valid role.");
          }
        }
      } catch (error) {
        console.error("Failed to load Firestore user profile:", error);

        if (active) {
          setError(
            error.code
              ? `Unable to load profile (${error.code}): ${error.message}`
              : "Unable to load your profile. Check the browser console."
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function testInvoiceApi() {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No signed-in user found.");
        return;
      }

      const token = await currentUser.getIdToken();

      const response = await fetch("/api/invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      console.log("Invoice API status:", response.status);
      console.log("Invoice API response:", result);
    } catch (error) {
      console.error("Invoice API test failed:", error);
    }
  }

  async function testCreateInvoiceApi() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No signed-in user.");
      return;
    }

    const token = await currentUser.getIdToken();

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: "2lQckPYAcffcHi011RPllfEn1kk2",
        invoiceNumber: "TEST-001",
        description: "Test invoice",
        amount: 100,
        dueDate: "2026-11-30",
      }),
    });

    console.log("Create invoice status:", response.status);
    console.log("Create invoice response:", await response.json());
  }

  async function testClientsApi() {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No signed-in user.");
      return;
    }

    const token = await currentUser.getIdToken();

    const response = await fetch("/api/clients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Clients API status:", response.status);
    console.log("Clients API response:", await response.json());
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
        Checking your account...
      </main>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (error || !role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 text-zinc-900">
        <section className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8">
          <h1 className="text-xl font-semibold">403 — Unauthorized</h1>
          <p className="mt-3 text-sm text-zinc-600">
            {error || "Your account does not have permission to access this application."}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white"
          >
            Sign out
          </button>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
        <span className="text-sm text-zinc-600">
          Signed in as {user.email} · {role}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
        >
          Sign out
        </button>
      </div>

      <div>
        <div className="flex items-center justify-center gap-3 border-b border-amber-300 bg-amber-50 p-3 text-center">
          <button
            type="button"
            onClick={testInvoiceApi}
            className="rounded bg-amber-600 px-4 py-2 text-sm text-white"
          >
            Test Invoice API
          </button>
          <button
            type="button"
            onClick={testCreateInvoiceApi}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
          >
            Test Create Invoice
          </button>
          <button
            type="button"
            onClick={testClientsApi}
            className="rounded bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            Test Clients API
          </button>
        </div>

        {role === "admin" ? (
          <AdminDashboard profile={profile} />
        ) : (
          <ClientDashboard profile={profile} />
        )}
      </div>
    </>
  );
}
