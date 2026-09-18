"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

/**
 * Custom-styled checkbox built on a real <input type="checkbox"> so it
 * keeps native keyboard and form semantics; the visual box is drawn with
 * a peer-based Tailwind pattern.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const checkboxId = id ?? props.name;

    return (
      <div>
        <div className="flex items-start gap-2.5">
          <div className="relative flex h-5 items-center">
            <input
              ref={ref}
              aria-invalid={Boolean(error)}
              className={`peer h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-md border-2 border-[#D1D5DB] bg-white transition-colors duration-150 checked:border-[#10B981] checked:bg-[#10B981] focus:outline-none focus:ring-4 focus:ring-[#10B981]/20 ${className}`}
              id={checkboxId}
              type="checkbox"
              {...props}
            />
            <Check
              className="pointer-events-none absolute left-[3px] top-[3px] hidden text-white peer-checked:block"
              size={13}
              strokeWidth={3}
            />
          </div>
          <label
            className="cursor-pointer text-sm leading-relaxed text-[#374151]"
            htmlFor={checkboxId}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
