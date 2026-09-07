"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  X,
  AlertCircle,
} from "lucide-react";

type Question = {
  id: string;
  category: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export default function ManageQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New question form
  const [newCategory, setNewCategory] = useState("Earthquake");
  const [newText, setNewText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctIdx, setCorrectIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/admin/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        if (data.questions?.length > 0) {
          setExpanded([data.questions[0].id]);
        }
      }
    } catch (err) {
      console.error("Fetch questions error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleExpand = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter((e) => e !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !optA.trim() || !optB.trim()) {
      showFeedback("error", "Question text and at least Options A and B are required");
      return;
    }

    setSaving(true);
    const options = [optA.trim(), optB.trim(), optC.trim() || "N/A", optD.trim() || "N/A"];
    const quizSlug =
      newCategory.toLowerCase() === "earthquake"
        ? "earthquake-basics"
        : newCategory.toLowerCase() === "flood"
        ? "flood-survival"
        : "fire-safety";

    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizSlug,
          text: newText.trim(),
          options,
          correctAnswerIndex: Number(correctIdx),
          explanation: newExplanation.trim(),
        }),
      });

      if (res.ok) {
        showFeedback("success", "Question added successfully!");
        setShowAddModal(false);
        setNewText("");
        setOptA("");
        setOptB("");
        setOptC("");
        setOptD("");
        setNewExplanation("");
        fetchQuestions();
      } else {
        const data = await res.json();
        showFeedback("error", data.error || "Failed to create question");
      }
    } catch (err: any) {
      showFeedback("error", err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" });
      if (res.ok) {
        showFeedback("success", "Question deleted");
        fetchQuestions();
      } else {
        showFeedback("error", "Failed to delete question");
      }
    } catch (err) {
      showFeedback("error", "Network error");
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.4s_ease-out]">
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-70 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl border animate-[slideDown_0.3s_ease-out] ${
            feedback.type === "success"
              ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
              : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">Quiz Questions</h1>
            <span className="rounded-full bg-[#10B981]/15 px-2.5 py-0.5 text-xs font-bold text-[#059669]">
              Assessment Bank
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Create and manage standardized disaster preparedness knowledge verification questions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#059669] transition active:scale-98"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-20 text-center shadow-2xs">
          <RotateCw size={32} className="animate-spin text-[#10B981] mb-3" />
          <p className="text-sm font-bold text-[#0F172A]">Loading assessment bank...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white py-20 text-center">
          <HelpCircle size={40} className="text-[#94A3B8] mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">No Questions Found</h3>
          <p className="mt-1 text-xs text-[#64748B] max-w-sm">
            The question bank is currently empty. Click &quot;Add Question&quot; above to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            const isExp = expanded.includes(q.id);
            return (
              <div
                key={q.id}
                className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-2xs transition hover:border-[#CBD5E1]"
              >
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="flex cursor-pointer items-center justify-between p-5 select-none"
                >
                  <div className="flex items-start gap-3.5 pr-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-xs font-black text-white">
                      {qIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-bold text-[#059669]">
                          {q.category}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-[#0F172A] leading-snug">{q.text}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(q.id);
                      }}
                      className="rounded-xl p-2 text-[#DC2626] hover:bg-[#FEF2F2] transition"
                      title="Delete Question"
                    >
                      <Trash2 size={15} />
                    </button>
                    <span className="text-[#94A3B8]">
                      {isExp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] p-5 space-y-3">
                    <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Answer Options</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctAnswerIndex;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                              isCorrect
                                ? "border-[#10B981] bg-[#ECFDF5] text-[#065F46] font-bold shadow-2xs"
                                : "border-[#E2E8F0] bg-white text-[#334155]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[#64748B]">{String.fromCharCode(65 + idx)}.</span>
                              <span>{opt}</span>
                            </div>
                            {isCorrect && <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="rounded-2xl bg-white p-3.5 border border-[#E2E8F0] text-xs text-[#475569] leading-relaxed">
                        <span className="font-bold text-[#0F172A]">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="flex flex-col w-full max-w-lg max-h-[90vh] rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-6 py-4 shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0F172A]">Add Assessment Question</h3>
                <p className="text-xs text-[#64748B]">Insert a multiple-choice question into the quiz system</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="question-form" onSubmit={handleAddQuestion} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#334155]">Disaster Category <span className="text-[#DC2626]">*</span></label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                >
                  <option value="Earthquake">Earthquake</option>
                  <option value="Flood">Flood</option>
                  <option value="Fire">Fire</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Heatwave">Heatwave</option>
                  <option value="General">General Disaster Safety</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Question Text <span className="text-[#DC2626]">*</span></label>
                <input
                  type="text"
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. What is the PASS method for operating a fire extinguisher?"
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#334155]">Option A <span className="text-[#DC2626]">*</span></label>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="First option"
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-2.5 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#334155]">Option B <span className="text-[#DC2626]">*</span></label>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Second option"
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-2.5 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#334155]">Option C</label>
                  <input
                    type="text"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Third option (optional)"
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-2.5 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#334155]">Option D</label>
                  <input
                    type="text"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Fourth option (optional)"
                    className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-2.5 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Correct Option <span className="text-[#DC2626]">*</span></label>
                <select
                  value={correctIdx}
                  onChange={(e) => setCorrectIdx(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-bold text-[#059669] bg-[#ECFDF5] focus:border-[#10B981] focus:outline-none"
                >
                  <option value={0}>Option A (Correct)</option>
                  <option value={1}>Option B (Correct)</option>
                  <option value={2}>Option C (Correct)</option>
                  <option value={3}>Option D (Correct)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#334155]">Explanation / Life-Saving Rationale</label>
                <textarea
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct and key survival takeaways..."
                  className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] p-3 text-sm font-medium text-[#0F172A] focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 focus:outline-none resize-y max-h-36 overflow-y-auto"
                  rows={3}
                />
              </div>
            </form>

            {/* STICKY ALWAYS-VISIBLE FOOTER */}
            <div className="flex items-center justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="question-form"
                disabled={saving}
                className="rounded-xl bg-[#10B981] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#059669] shadow-sm disabled:opacity-50 flex items-center gap-1.5 transition active:scale-98"
              >
                {saving ? (
                  <>
                    <RotateCw size={14} className="animate-spin" /> Saving Question...
                  </>
                ) : (
                  "Save Question"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
