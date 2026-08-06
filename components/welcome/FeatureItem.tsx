import type { ReactNode } from "react";
import { Check } from "lucide-react";

interface FeatureItemProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

/**
 * Left-accented feature row for the welcome screen's benefit list.
 * The green edge + checkmark badge pattern is shared by every row so the
 * list reads as one consistent set, not four separate cards.
 */
export default function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border-l-4 border-[#10B981] bg-[#F9FAFB] px-4 py-4">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
        <Check size={14} strokeWidth={3} />
      </span>
      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
        <p className="mt-0.5 text-sm leading-relaxed text-[#6B7280]">
          {description}
        </p>
      </div>
    </div>
  );
}