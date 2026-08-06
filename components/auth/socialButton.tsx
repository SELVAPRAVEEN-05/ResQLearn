"use client";

interface SocialButtonProps {
  onClick?: () => void;
}

/** "Continue with Google" button. Purely presentational — no OAuth wiring. */
export default function SocialButton({ onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-[15px] font-medium text-[#374151] transition-all duration-200 hover:border-[#D1D5DB] hover:bg-[#F9FAFB] focus:outline-none focus:ring-4 focus:ring-[#10B981]/10 active:bg-[#F3F4F6]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.02c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.79-2.12-6.74-4.96H1.27v3.12A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.26 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.27a12 12 0 0 0 0 10.78l3.99-3.12Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l3.99 3.12C6.21 6.89 8.87 4.77 12 4.77Z"
        />
      </svg>
      Continue with Google
    </button>
  );
}