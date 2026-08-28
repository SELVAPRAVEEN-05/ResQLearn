"use client";

import { useState } from "react";
import { Search, MoreVertical, ShieldCheck, UserX, UserCheck, Trash2 } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Admin";
  status: "Active" | "Inactive";
};

const initialUsers: User[] = [
  { id: "101", name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Student", status: "Active" },
  { id: "102", name: "Michael Chen", email: "m.chen@example.com", role: "Student", status: "Active" },
  { id: "103", name: "Admin Supervisor", email: "admin@safegraph.ai", role: "Admin", status: "Active" },
  { id: "104", name: "Emily Watson", email: "ewatson@example.com", role: "Student", status: "Inactive" },
  { id: "105", name: "James Holden", email: "jholden@example.com", role: "Student", status: "Active" },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-6 pb-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-[#111827]">Manage Users</h1>
        <p className="text-sm text-[#6B7280]">View and manage platform users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
        <input 
          type="text" 
          placeholder="Search users..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]"
        />
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] font-bold text-[#6B7280]">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">{user.name}</p>
                  <p className="text-xs text-[#6B7280]">{user.email}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${user.role === 'Admin' ? 'bg-[#DBEAFE] text-[#1D4ED8]' : 'bg-[#F3F4F6] text-[#4B5563]'}`}>
                {user.role}
              </span>
            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-[#F3F4F6] pt-3">
              <span className={`flex items-center gap-1 text-xs font-medium ${user.status === 'Active' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                <div className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></div>
                {user.status}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStatus(user.id)}
                  className="rounded p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
                  title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                >
                  {user.status === 'Active' ? <UserX size={16} /> : <UserCheck size={16} />}
                </button>
                <button 
                  onClick={() => deleteUser(user.id)}
                  className="rounded p-1.5 text-[#EF4444] hover:bg-[#FEF2F2]"
                  title="Delete User"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="py-10 text-center text-sm text-[#6B7280]">
            No users found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
