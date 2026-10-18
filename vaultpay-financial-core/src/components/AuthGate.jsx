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
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      setUser(currentUser);
      setRole(null);
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
          const userRole = profile.data().role?.toLowerCase();

          if (userRole === "admin" || userRole === "client") {
            setRole(userRole);
          } else {
            setError("Your account does not have a valid role.");
          }
        }
      } catch {
        if (active) {
          setError("Unable to load your profile. Check your connection and database rules.");
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

      {role === "admin" ? <AdminDashboard /> : <ClientDashboard />}
    </>
  );
}
