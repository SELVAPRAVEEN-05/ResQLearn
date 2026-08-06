interface DividerProps {
  label: string;
}

/** Horizontal rule with a centered label, used to separate form / OAuth actions. */
export default function Divider({ label }: DividerProps) {
  return (
    <div className="flex items-center gap-3" role="separator">
      <div className="h-px flex-1 bg-[#E5E7EB]" />
      <span className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[#E5E7EB]" />
    </div>
  );
}