"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
  placeholder?: string;
}

/**
 * Styled native <select>. Uses a real select element (rather than a custom
 * listbox) so keyboard and screen-reader behavior comes for free.
 */
const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { label, error, options, placeholder, id, className = "", ...props },
    ref,
  ) => {
    const selectId = id ?? props.name;

    return (
      <div className="w-full">
        <label
          className="mb-1.5 block text-sm font-medium text-[#111827]"
          htmlFor={selectId}
        >
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            aria-describedby={error ? `${selectId}-error` : undefined}
            aria-invalid={Boolean(error)}
            className={`w-full appearance-none rounded-xl border bg-white py-3 pl-4 pr-10 text-[15px] transition-all duration-200 focus:outline-none focus:ring-4 ${
              props.value ? "text-[#111827]" : "text-[#9CA3AF]"
            } ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-[#E5E7EB] focus:border-[#10B981] focus:ring-[#10B981]/15"
            } ${className}`}
            id={selectId}
            {...props}
          >
            <option disabled hidden value="">
              {placeholder ?? "Select an option"}
            </option>
            {options.map((option) => (
              <option key={option} className="text-[#111827]" value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]">
            <ChevronDown size={18} strokeWidth={1.75} />
          </span>
        </div>
        {error && (
          <p
            className="mt-1.5 text-xs font-medium text-red-500"
            id={`${selectId}-error`}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

SelectField.displayName = "SelectField";

export default SelectField;
