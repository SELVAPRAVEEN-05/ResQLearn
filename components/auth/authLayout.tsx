import type { ReactNode } from "react";
import { Sparkles, Check } from "lucide-react";
import KnowledgeGraphIllustration from "./KnowledgeGraphIllustration";

interface AuthLayoutProps {
  heading: string;
  description: string;
  features: string[];
  illustrationVariant?: "shield" | "cap";
  children: ReactNode;
}

/**
 * Shared shell for the login and register pages: a left brand/illustration
 * panel (hidden on small screens) and a right panel that centers whatever
 * form card is passed in as `children`.
 */
export default function AuthLayout({
  heading,
  description,
  features,
  illustrationVariant = "shield",
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#F9FAFB]">
      {/* Left panel — hidden below lg, per "hide illustration on mobile" spec */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF9] to-[#F9FAFB] px-12 py-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#10B981]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[#10B981]/10 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10B981] text-white">
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[#111827]">
            SafeGraph AI
          </span>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center py-8">
          <KnowledgeGraphIllustration variant={illustrationVariant} />
        </div>

        <div className="relative z-10 max-w-md animate-[fadeIn_0.6s_ease-out]">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#111827]">
            {heading}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">
            {description}
          </p>
          <ul className="mt-6 space-y-2.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#10B981]/15 text-[#0D9268]">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span className="text-sm text-[#374151]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form card, centered on all breakpoints */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:w-[55%]">
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10B981] text-white">
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-[#111827]">
            SafeGraph AI
          </span>
        </div>

        <div className="w-full max-w-md">{children}</div>

        <footer className="mt-8 text-center text-xs text-[#9CA3AF]">
          © 2026 SafeGraph AI
        </footer>
      </div>
    </div>
  );
}