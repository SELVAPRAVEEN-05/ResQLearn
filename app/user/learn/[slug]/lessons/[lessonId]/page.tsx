import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle, Mountain, Megaphone, Waves, Car, ArrowLeft, ArrowRight } from "lucide-react";

export default function LessonPage(props: { params: any }) {
  const { params } = props;

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <p className="text-xs font-medium text-[#6B7280]">
        Learn <span className="mx-1">›</span> Emergency Response
      </p>

      <div>
        <h1 className="text-xl font-bold text-[#111827]">What To Do During a Flood</h1>
        <p className="mt-2 text-sm leading-6 text-[#6B7280]">
          Critical action steps to maximize safety during rapid water level rise.
        </p>
      </div>

      {/* Critical warning */}
      <div className="rounded-3xl bg-[#FEE2E2] p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-[#DC2626]" />
          <p className="text-sm font-bold text-[#DC2626]">Critical Warning</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-[#991B1B]">
          Never touch electrical equipment in wet areas. If you are wet or standing in water, touching
          electronics can lead to fatal electrocution.
        </p>
      </div>

      {/* DO */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D1FAE5] text-[#059669]">
            <CheckCircle2 size={15} />
          </span>
          <p className="text-sm font-bold uppercase tracking-wide text-[#059669]">Do</p>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Mountain size={16} className="mt-0.5 shrink-0 text-[#6B7280]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Move to higher ground</p>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Immediately seek elevation. Do not wait for instructions to move if water is rising rapidly.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Megaphone size={16} className="mt-0.5 shrink-0 text-[#6B7280]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Follow official instructions</p>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Monitor emergency broadcasts via battery-powered radio or mobile alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex h-36 items-center justify-center rounded-2xl bg-gradient-to-b from-[#D1FAE5] to-[#ECFDF5]">
          <span className="text-xs font-medium text-[#059669]">Illustration: hiker moving to safety</span>
        </div>
      </div>

      {/* DON'T */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
            <XCircle size={15} />
          </span>
          <p className="text-sm font-bold uppercase tracking-wide text-[#DC2626]">Don't</p>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex gap-3">
            <Waves size={16} className="mt-0.5 shrink-0 text-[#6B7280]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Walk through moving water</p>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Just 6 inches of moving water can knock you down. Use a stick to check depth if you must
                cross still water.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Car size={16} className="mt-0.5 shrink-0 text-[#6B7280]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Drive through flooded roads</p>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Turn Around, Don't Drown. Most flood fatalities occur in vehicles.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex h-36 items-center justify-center rounded-2xl bg-gradient-to-b from-[#FEE2E2] to-[#FEF2F2]">
          <span className="text-xs font-medium text-[#DC2626]">Illustration: do not drive through flooded areas</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]">
          <ArrowLeft size={16} /> Previous Lesson
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#10B981] bg-white px-4 py-3 text-sm font-semibold text-[#10B981] transition hover:bg-[#F0FDF4]">
          <CheckCircle2 size={16} /> Mark as Complete
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E9F72]">
          Next Lesson <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
