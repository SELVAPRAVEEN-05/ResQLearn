"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, Mail, Camera, RotateCw } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [avatar, setAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.profile) {
          setName(data.profile.name || "");
          setEmail(data.profile.email || "");
          setInstitution(data.profile.institution || "");
          setDepartment(data.profile.department || "");
          setYearOfStudy(data.profile.year_of_study || "");
          setAvatar(data.profile.avatar || "");
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Profile load error:", e);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          institution,
          department,
          yearOfStudy,
          avatar,
        }),
      });

      if (res.ok) {
        router.push("/user/profile");
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to update profile" }));
        alert(err.error || "Update failed");
      }
    } catch (e: any) {
      console.error("Save error:", e);
      alert("Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-[fadeIn_0.5s_ease-out] pb-10">
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1 transition hover:bg-[#F3F4F6]"
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="text-[#111827]" />
        </button>
        <h1 className="text-xl font-bold text-[#111827]">Edit Profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
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
          <p className="text-xs text-[#6B7280] mt-2">Avatar URL (optional)</p>
          <input
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            className="mt-1 text-center text-xs border-b border-[#E5E7EB] focus:outline-none focus:border-[#10B981] pb-1 w-full max-w-[240px]"
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-[#374151]">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
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
            <label className="mb-1.5 block text-xs font-bold uppercase text-[#374151]">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] py-3 pl-10 pr-4 text-sm text-[#6B7280] cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-[#374151]">Institution / Organization</label>
            <input
              type="text"
              placeholder="e.g. Bannari Amman Institute of Technology"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-3 px-4 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-[#374151]">Department</label>
              <input
                type="text"
                placeholder="e.g. CSE / IT"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-3 px-4 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-[#374151]">Year of Study</label>
              <input
                type="text"
                placeholder="e.g. 3rd Year"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-3 px-4 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#10B981]/30"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0E9F72] disabled:opacity-50"
        >
          {saving ? (
            <>
              <RotateCw size={16} className="animate-spin" /> Saving Changes...
            </>
          ) : (
            <>
              <Save size={18} /> Save Changes
            </>
          )}
        </button>
      </form>
    </section>
  );
}
