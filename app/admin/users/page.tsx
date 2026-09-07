"use client";

import { useState, useEffect } from "react";
import { Search, UserX, UserCheck, Trash2, Users, Shield, RotateCw } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Admin";
  status: "Active" | "Inactive";
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id: string) => {
    // Optimistic UI update
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
      )
    );
    try {
      await fetch(`/api/admin/users/${id}/status`, { method: "PATCH" });
    } catch (err) {
      console.error("Toggle status error:", err);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUsers(users.filter((u) => u.id !== id));
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete user error:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">Manage Users</h1>
            <span className="rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-xs font-bold text-[#059669]">
              {users.length} Users Registered
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">View, activate, deactivate, and manage platform user credentials.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
        <input
          type="text"
          placeholder="Search users by full name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-[#CBD5E1] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 shadow-2xs"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-20 text-center shadow-2xs">
          <RotateCw size={32} className="animate-spin text-[#10B981] mb-3" />
          <p className="text-sm font-bold text-[#0F172A]">Loading users from Neon PostgreSQL...</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-2xs transition hover:border-[#CBD5E1] hover:shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F1F5F9] font-black text-[#334155] text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">{user.name}</p>
                    <p className="text-xs text-[#64748B]">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    user.role === "Admin"
                      ? "bg-[#DBEAFE] text-[#1D4ED8]"
                      : "bg-[#F1F5F9] text-[#475569]"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#F1F5F9] pt-3">
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    user.status === "Active" ? "text-[#059669]" : "text-[#DC2626]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.status === "Active" ? "bg-[#10B981]" : "bg-[#DC2626]"
                    }`}
                  />
                  {user.status}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className="rounded-xl p-2 text-[#64748B] hover:bg-[#F1F5F9] transition"
                    title={user.status === "Active" ? "Deactivate User" : "Activate User"}
                  >
                    {user.status === "Active" ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="rounded-xl p-2 text-[#DC2626] hover:bg-[#FEF2F2] transition"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs font-bold text-[#94A3B8]">
              No users found matching &quot;{search}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
