import Link from "next/link";
import Image from "next/image";

import { BookOpen, Network, TriangleAlert, Users } from "lucide-react";

const FEATURES = [
  {
    title: "AI-Powered Learning",
    description: "Lessons that adapt to how you learn and what you already know.",
    icon: BookOpen,
  },
  {
    title: "Explainable Knowledge Graphs",
    description: "See exactly how disaster concepts connect - and why they matter.",
    icon: Network,
  },
  {
    title: "Interactive Simulations",
    description: "Practice real emergency scenarios in a safe, guided environment.",
    icon: TriangleAlert,
  },
  {
    title: "Track Your Readiness",
    description: "Monitor your progress and preparedness level over time.",
    icon: Users,
  },
];

function SafeGraphLogo() {
  return (
    <Image
  src="/images/app_logo.png"
  alt="SafeGraph AI logo"
  width={200}
  height={200}
  priority
  className="w-70 h-70 object-contain"
/>
  );
}

/**
 * First-run welcome screen. Introduces SafeGraph AI, highlights core
 * capabilities, and routes into registration (new students) or login
 * (returning users). Mobile-first, centered on larger screens.
 */
export default function WelcomePage() {
  return (
    <div className="relative flex min-h-screen w-full justify-center overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#071D18]">
        <Image
          src="/images/app_front.png"
          alt="SafeGraph AI start page background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,40,31,0.47)_0%,rgba(6,34,27,0.57)_100%)]" />

      <div className="relative z-10 flex min-h-screen w-full max-w-md flex-col px-6 pb-7 pt-12 text-white">
        <section className="text-center">
          <div className="flex justify-center">
            <div className="animate-[fadeIn_0.6s_ease-out]">
              <SafeGraphLogo />
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            SafeGraph AI
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-[15px] leading-relaxed text-white/92">
            Learn disaster preparedness through explainable AI and knowledge graphs.
          </p>
        </section>

        <section className="mt-11 flex-1 space-y-7">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="flex items-start gap-4">
                <span className="mt-[2px] flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0FC28E] text-white">
                  <Icon size={29} strokeWidth={1.8} />
                </span>
                <div className="pt-0.5">
                  <h2 className="text-[18px] font-semibold leading-snug text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-[13px] leading-[1.45] text-white/90">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="pb-2 pt-7">
          <Link
            href="/register"
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-[18px] font-semibold text-[#10B981] shadow-[0_8px_26px_-16px_rgba(0,0,0,0.75)]"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/70 bg-white/10 px-6 py-3 text-[16px] font-semibold text-white backdrop-blur-[1px]"
          >
            Log In
          </Link>
        </section>

        <section className="flex justify-center pb-2 pt-2">
          <div className="h-1.5 w-32 rounded-full bg-white/85" />
        </section>
      </div>
    </div>
  );
}