"use client";

import { useState } from "react";
import ClientDashboard from "@/components/ClientDashboard";
import Home from "@/components/AdminDashboard";

export default function RolePreview() {
  const [role, setRole] = useState("Admin");

  return (
    <>
      <div className="flex items-center justify-end gap-3 border-b border-zinc-200 bg-zinc-100 px-6 py-3">
        <span className="text-xs text-zinc-500">
          Development preview only
        </span>

        <label htmlFor="role-preview" className="text-sm font-medium">
          Preview role
        </label>

        <select
          id="role-preview"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
        >
          <option value="Admin">Admin</option>
          <option value="Client">Client</option>
        </select>
      </div>

      {role === "Admin" ? <Home /> : <ClientDashboard />}
    </>
  );
}
