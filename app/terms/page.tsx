import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  ["User responsibilities", "Provide accurate registration information and use SafeGraph AI in a way that supports a respectful learning community."],
  ["Account usage", "Your account is for your own educational use. Do not share access, impersonate another person, or use another user's account."],
  ["Educational content", "Courses and preparedness materials are educational resources. Follow instructions from local emergency authorities during a real event."],
  ["Quiz and assessment usage", "Quizzes are intended for learning and progress tracking. Do not attempt to manipulate scores, submissions, or another learner's records."],
  ["AI-generated responses", "AI responses are informational and may be incomplete or incorrect. Verify urgent safety guidance with official local emergency services."],
  ["Acceptable use", "Do not disrupt the service, probe its security, upload malicious content, or use it for unlawful, harmful, or fraudulent activity."],
  ["Account security", "Keep your password private and tell the administrator promptly if you suspect unauthorized access."],
  ["Limitation of responsibility", "SafeGraph AI is not a substitute for official warnings, professional advice, emergency services, or an emergency response plan."],
  ["Changes to terms", "We may update these terms when the service or legal requirements change. The current version will remain available on this page."],
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-[#111827] sm:px-6 sm:py-12">
      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-8 lg:p-10">
        <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#059669] hover:underline" href="/register">
          <ArrowLeft size={16} /> Back to registration
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <ShieldCheck className="text-[#10B981]" size={28} />
          <div>
            <p className="text-sm font-semibold text-[#059669]">SafeGraph AI</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Terms &amp; Conditions</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#6B7280]">These terms describe the expectations for using the SafeGraph AI disaster preparedness learning platform.</p>
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