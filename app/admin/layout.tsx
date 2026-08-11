"use client";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">{children}</main>
    </div>
  );
}
