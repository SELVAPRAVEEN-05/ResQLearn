import {
  Droplet,
  Mountain,
  Flame,
  Waves,
  Zap,
  ShieldCheck,
  Pencil,
  Award,
  Users,
  HelpCircle,
  LogOut,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const stats = [
  { label: "Courses\nCompleted", value: "5" },
  { label: "Avg Quiz\nScore", value: "88%" },
  { label: "Certificates\nEarned", value: "2" },
];

const learningProgress = [
  { title: "Flood Safety", icon: Droplet, progress: 100 },
  { title: "Earthquake Preparedness", icon: Mountain, progress: 60 },
  { title: "Wildfire Response", icon: Flame, progress: 25 },
];

const badges = [
  { title: "Flood Expert", icon: Waves },
  { title: "Rapid Responder", icon: Zap },
  { title: "Safety First", icon: ShieldCheck },
];

const menuItems = [
  { label: "Edit Profile", icon: Pencil, href: "/user/profile/edit" },
  { label: "My Certificates", icon: Award, href: "/user/profile/certificates" },
  { label: "Account Settings", icon: Users, href: "/user/settings" },
  { label: "Help & Support", icon: HelpCircle, href: "/user/help" },
];

export default function ProfilePage() {
  return (
    <section className="space-y-4">
      {/* Identity card */}
      <div className="flex flex-col items-center rounded-3xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#F3F4F6]">
            <Users size={32} className="text-[#9CA3AF]" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#10B981] text-white">
            <CheckCircle2 size={12} />
          </span>
        </div>
        <p className="mt-4 text-lg font-bold text-[#111827]">Sarah Jenkins</p>
        <p className="text-sm text-[#6B7280]">sarah.j@example.com</p>
        <span className="mt-3 rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#047857]">
          Verified Responder
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-bold text-[#10B981]">{stat.value}</p>
            <p className="mt-1 whitespace-pre-line text-xs leading-tight text-[#6B7280]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Learning progress */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="text-lg font-bold text-[#111827]">Learning Progress</p>
        <div className="mt-4 space-y-4">
          {learningProgress.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                    <Icon size={14} className="text-[#6B7280]" />
                    {item.title}
                  </span>
                  <span className="text-xs font-semibold text-[#10B981]">{item.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[#F3F4F6]">
                  <div className="h-1.5 rounded-full bg-[#10B981]" style={{ width: `${item.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <p className="text-lg font-bold text-[#111827]">My Badges</p>
        <div className="mt-4 flex gap-5 overflow-x-auto pb-1">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className="flex shrink-0 flex-col items-center gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white">
                  <Icon size={22} />
                </span>
                <p className="w-16 text-center text-xs font-medium leading-tight text-[#111827]">{badge.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu */}
      <div className="divide-y divide-[#E5E7EB] rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.label} href={item.href} className="flex items-center justify-between p-4 transition hover:bg-[#F9FAFB]">
              <span className="flex items-center gap-3 text-sm font-medium text-[#111827]">
                <Icon size={18} className="text-[#6B7280]" />
                {item.label}
              </span>
              <ChevronRight size={16} className="text-[#9CA3AF]" />
            </a>
          );
        })}
        <button className="flex w-full items-center gap-3 p-4 text-left text-sm font-medium text-[#DC2626] transition hover:bg-[#FEF2F2]">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </section>
  );
}