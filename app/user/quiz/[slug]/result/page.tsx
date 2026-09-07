"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ListChecks, CheckCircle2, XCircle, Timer, Award, Download, Eye, ArrowLeft, RotateCw } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface AttemptDetail {
  id: string;
  userName: string;
  quizTitle: string;
  quizSlug: string;
  category: string;
  difficulty: string;
  score: number;
  total: number;
  passed: boolean;
  percentage: number;
  answers: Array<{
    questionId: string;
    userSelected?: number;
    correctAnswerIndex: number;
    isCorrect: boolean;
    explanation?: string;
  }>;
  createdAt: string;
}

interface QuizDetail {
  id: number;
  slug: string;
  title: string;
  category: string;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    explanation: string;
  }>;
}

export default function QuizResultPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const router = useRouter();

  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    async function loadResult() {
      try {
        if (attemptId) {
          const res = await fetch(`/api/quizzes/attempts/${attemptId}`);
          if (res.ok) {
            const data = await res.json();
            setAttempt(data.attempt);
          }
        }

        const qRes = await fetch(`/api/quizzes/${params.slug}`);
        if (qRes.ok) {
          const qData = await qRes.json();
          setQuiz(qData.quiz);
        }
      } catch (e) {
        console.error("Error loading attempt result:", e);
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [attemptId, params.slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <RotateCw size={28} className="animate-spin text-[#10B981] mb-2" />
        <p className="text-sm font-semibold text-[#111827]">Calculating verified score...</p>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-[#6B7280] text-sm">Attempt record not found.</p>
        <button
          onClick={() => router.push("/user/quiz")}
          className="text-[#10B981] font-bold text-xs flex items-center gap-2 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Assessments
        </button>
      </div>
    );
  }

  const scorePercent = attempt.percentage || Math.round((attempt.score / (attempt.total || 1)) * 100);
  const circumference = 2 * Math.PI * 54;
  const dash = (scorePercent / 100) * circumference;
  const isPassed = attempt.passed;

  const stats = [
    { label: "Total Questions", value: attempt.total.toString(), icon: ListChecks, iconColor: "#6B7280" },
    { label: "Correct Answers", value: attempt.score.toString(), icon: CheckCircle2, iconColor: "#10B981" },
    { label: "Incorrect", value: (attempt.total - attempt.score).toString(), icon: XCircle, iconColor: "#DC2626" },
    { label: "Status", value: isPassed ? "PASSED" : "RETAKE", icon: Timer, iconColor: isPassed ? "#10B981" : "#F59E0B" },
  ];

  return (
    <section className="space-y-5 animate-[fadeIn_0.5s_ease-out] pb-10">
      <div className="text-center">
        <h1 className="text-xl font-bold text-[#111827]">Assessment Result</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{attempt.quizTitle || quiz?.title}</p>
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-gradient-to-b from-white to-[#ECFDF5] p-8 shadow-sm relative overflow-hidden">
        <div className="mx-auto flex h-40 w-40 items-center justify-center relative z-10">
          <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#F3F4F6" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={isPassed ? "#10B981" : "#F59E0B"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <p className="text-3xl font-black text-[#111827]">{scorePercent}%</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">
              {isPassed ? "Certified" : "Review Required"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center shadow-sm">
              <Icon size={18} className="mx-auto" style={{ color: s.iconColor }} />
              <p className="mt-2 text-xl font-bold text-[#111827]">{s.value}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{s.label}</p>
            </div>
          );
        })}
      </div>

      {isPassed && (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D1FAE5] text-[#10B981]">
              <Award size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#111827]">{attempt.category || quiz?.category} Safety Certification Earned!</p>
              <p className="mt-1 text-xs leading-5 text-[#6B7280]">You have met the verified standard for disaster preparedness.</p>
            </div>
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0E9F72]"
            onClick={() => setShowCertificate(true)}
          >
            <Award size={16} /> View & Print Certificate
          </button>
        </div>
      )}

      {/* Review Answers Section */}
      {showReview && quiz?.questions && (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <h3 className="font-bold text-base text-[#111827]">Questions & Verified Explanations</h3>
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => {
              const reviewItem = attempt.answers?.find((a) => a.questionId === q.id);
              const userSelected = reviewItem?.userSelected;
              const isCorrect = reviewItem?.isCorrect;

              return (
                <div key={q.id} className="rounded-2xl border border-[#E5E7EB] p-4 bg-[#F9FAFB] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#10B981]">Question {idx + 1}</p>
                    {isCorrect !== undefined && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCorrect ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
                        {isCorrect ? "Correct ✓" : "Incorrect ✕"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#111827]">{q.text}</p>
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.options.indexOf(opt) && reviewItem ? oIdx === reviewItem.correctAnswerIndex : false;
                      const isUserChoice = userSelected === oIdx;

                      return (
                        <div
                          key={oIdx}
                          className={`text-xs p-2.5 rounded-xl border ${
                            isOptionCorrect
                              ? "bg-[#ECFDF5] border-[#10B981] text-[#065F46] font-bold"
                              : isUserChoice && !isCorrect
                              ? "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B] font-medium"
                              : "bg-white border-[#E5E7EB] text-[#4B5563]"
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}{" "}
                          {isOptionCorrect && "✓ (Correct Answer)"}
                          {isUserChoice && !isCorrect && " ✕ (Your Selection)"}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-[#6B7280] bg-white p-2.5 rounded-xl border border-[#E5E7EB] mt-2 leading-relaxed">
                      <strong className="text-[#111827]">Explanation: </strong> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => setShowReview(!showReview)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          <Eye size={16} /> {showReview ? "Hide Answers Review" : "Review Questions & Answers"}
        </button>

        <Link
          href={`/user/quiz/${params.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#10B981] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0E9F72]"
        >
          Retake Assessment
        </Link>
        <Link
          href="/user/quiz"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#F9FAFB]"
        >
          Back to Assessments
        </Link>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center border-4 border-[#10B981]/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-[#10B981]">
              <Award size={36} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981]">Certificate of Competency</span>
              <h2 className="text-xl font-extrabold text-[#111827] mt-1">{attempt.category || quiz?.category} Emergency Preparedness</h2>
              <p className="text-xs text-[#6B7280] mt-1">Issued by SafeGraph AI Emergency Response Academy</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs text-[#374151] space-y-1">
              <p>This certifies that</p>
              <p className="text-base font-bold text-[#111827]">{attempt.userName || "Student"}</p>
              <p className="text-xs text-[#6B7280]">
                has achieved a passing score of <strong>{scorePercent}%</strong> on the official {attempt.quizTitle || quiz?.title}.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-2xl bg-[#10B981] py-3 text-sm font-bold text-white hover:bg-[#0E9F72] transition"
              >
                Print Certificate
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white py-3 text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}