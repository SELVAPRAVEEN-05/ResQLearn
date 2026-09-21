import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

const sections = [
  ["Information we collect", "Registration collects your name, email address, institution, department, optional year of study, and a securely hashed password. The application also stores account status and timestamps."],
  ["Account and authentication", "Your account record is used to authenticate you and provide the student or administrator experience. Passwords are stored as bcrypt hashes, not readable passwords. Authentication uses an HTTP-only session cookie."],
  ["Progress and assessments", "The service stores course progress, lesson and material completion, quiz attempts, scores, certificates, alerts read, and profile information so learning features can work."],
  ["Location data", "The emergency map may use location information that you choose to provide through your browser or map interactions. Use of the map does not require sharing precise location with SafeGraph AI unless the feature explicitly requests it."],
  ["AI and questions", "Questions submitted to the in-app assistant are processed to generate a response and may be stored with your account as chat history. Do not submit passwords, payment details, or other sensitive information."],
  ["Storage and protection", "Application data is stored in the configured PostgreSQL database. Access is protected by authenticated API routes, role checks, and password hashing. No online system can guarantee absolute security."],
  ["Third-party services and APIs", "The application may request weather, map, and AI service data through its configured integrations. Those services receive only the information required for the requested feature and are governed by their own policies."],
  ["Retention and deletion", "Account and learning records are retained while your account is active. Contact the SafeGraph AI administrator to request account deletion or correction; deletion may remove associated progress and assessment history."],
  ["Your rights and contact", "You may request access to, correction of, or deletion of your account information by contacting the SafeGraph AI administrator through your institution or the application's administration channel."],
  ["Updates", "We may update this policy when the application or its integrations change. The current version will remain available on this page."],
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-[#111827] sm:px-6 sm:py-12">
      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline" href="/register">
            <ArrowLeft size={16} /> Back to registration
          </Link>
          <Link className="text-sm font-medium text-[#059669] hover:underline" href="/login">Go to login</Link>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <LockKeyhole className="text-[#10B981]" size={28} />
          <div>
            <p className="text-sm font-semibold text-[#059669]">SafeGraph AI</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Privacy Policy</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#6B7280]">This policy explains how SafeGraph AI handles information used to provide learning, assessment, preparedness, and account features.</p>
        <div className="mt-8 space-y-6">
          {sections.map(([title, content]) => (
            <section key={title}>
              <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
              <p className="mt-1.5 text-sm leading-6 text-[#4B5563]">{content}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-[#E5E7EB] pt-5 text-xs text-[#9CA3AF]">Last updated: September 20, 2026</p>
      </article>
    </main>
  );
}