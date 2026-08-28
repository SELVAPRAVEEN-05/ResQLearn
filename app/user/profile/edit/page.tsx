"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Mail, Camera } from "lucide-react";
import { useMockData } from "@/contexts/MockDataContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, updateProfile } = useMockData();
  
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatar, setAvatar] = useState(profile.avatar || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, email, avatar);
    router.push("/user/profile");
  };

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => router.back()} className="rounded-full p-1 transition hover:bg-[#F3F4F6]" aria-label="Go back">
          <ArrowLeft size={18} className="text-[#111827]" />
        </button>
        <h1 className="text-xl font-bold text-[#111827]">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6] border-2 border-[#E5E7EB]">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User size={40} className="text-[#9CA3AF]" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mt-3">Tap to change avatar</p>
          <input 
            type="text" 
            placeholder="Avatar URL (optional)" 
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="mt-3 text-center text-sm border-b border-[#E5E7EB] focus:outline-none focus:border-[#10B981] pb-1 w-full max-w-[200px]"
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-3 pl-10 pr-4 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-3 pl-10 pr-4 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
        >
          <Save size={18} /> Save Changes
        </button>
      </form>
    </section>
  );
}
