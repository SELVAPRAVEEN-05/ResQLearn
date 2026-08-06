import Link from "next/link";
import WelcomeIllustration from "@/components/welcome/WelcomeIllustration";
import FeatureItem from "@/components/welcome/FeatureItem";

const FEATURES = [
  {
    title: "AI-Powered Learning",
    description: "Lessons that adapt to how you learn and what you already know.",
  },
  {
    title: "Explainable Knowledge Graphs",
    description: "See exactly how disaster concepts connect — and why they matter.",
  },
  {
    title: "Interactive Simulations",
    description: "Practice real emergency scenarios in a safe, guided environment.",
  },
  {
    title: "Track Your Readiness",
    description: "Monitor your progress and preparedness level over time.",
  },
];

/**
 * First-run welcome screen. Introduces SafeGraph AI, highlights core
 * capabilities, and routes into registration (new students) or login
 * (returning users). Mobile-first, centered on larger screens.
 */
export default function WelcomePage() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-white">
      <div className="flex w-full max-w-md flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-[#10B981] to-[#0D9268] px-6 pb-14 pt-16 text-center sm:rounded-b-[3rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-14 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />

          <div className="relative z-10 mx-auto flex justify-center animate-[fadeIn_0.6s_ease-out]">
            <WelcomeIllustration />
          </div>

          <div className="relative z-10 mt-8 animate-[fadeIn_0.6s_ease-out_0.1s_both]">
            <p className="text-sm font-medium text-white/80">Welcome to</p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">
              SafeGraph AI
            </h1>
            <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-white/85">
              Learn disaster preparedness through explainable AI and knowledge graphs.
            </p>
          </div>
        </section>

        {/* Feature list */}
        <section className="flex-1 px-6 pb-6 pt-8">
          <div className="space-y-3.5">
            {FEATURES.map((feature) => (
              <FeatureItem
                key={feature.title}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="px-6 pb-10">
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#10B981] px-5 py-3.5 text-[15px] font-semibold text-white shadow-sm shadow-emerald-900/10 transition-all duration-200 hover:bg-[#0EA271] active:bg-[#0D9268] focus:outline-none focus:ring-4 focus:ring-[#10B981]/25"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#10B981] px-5 py-3.5 text-[15px] font-semibold text-[#10B981] transition-all duration-200 hover:bg-[#ECFDF5] focus:outline-none focus:ring-4 focus:ring-[#10B981]/15"
          >
            Log In
          </Link>
          <p className="mt-6 text-center text-sm italic text-[#9CA3AF]">
            Prepare smarter. Respond safer.
          </p>
        </section>
      </div>
    </div>
  );
}