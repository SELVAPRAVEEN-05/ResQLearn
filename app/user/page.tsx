import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import DashboardPage from "./dashboard/page";

export default function UserPage() {
  return (
    <div>
        <DashboardPage />
    </div>
    // <section className="space-y-4">
    //   <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
    //     <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]">
    //       <ShieldCheck size={22} />
    //     </span>
    //     <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">
    //       User Portal
    //     </p>
    //     <h1 className="mt-2 text-xl font-bold text-[#111827]">Welcome to SafeGraph AI</h1>
    //     <p className="mt-2 text-sm leading-6 text-[#6B7280]">
    //       Fast, mobile-first access to alerts, readiness tools, and your dashboard summary.
    //     </p>
    //   </div>

    //   <div className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
    //     <p className="text-sm font-semibold text-[#111827]">Your next step</p>
    //     <p className="mt-2 text-sm text-[#6B7280]">
    //       Open the dashboard to see your current risk level, course progress, and emergency guidance.
    //     </p>
    //   </div>

    //   <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
    //     <p className="text-sm font-semibold text-[#111827]">Quick access</p>
    //     <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
    //       <li>• Check current alerts</li>
    //       <li>• Review your progress</li>
    //       <li>• Access help resources</li>
    //     </ul>
    //   </div>

    //   <Link
    //     href="/user/dashboard"
    //     className="flex items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]"
    //   >
    //     Open Dashboard <ArrowRight size={16} />
    //   </Link>
    // </section>
  );
}