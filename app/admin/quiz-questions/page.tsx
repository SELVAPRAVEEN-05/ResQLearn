"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Filter, ChevronDown, CheckCircle2 } from "lucide-react";

type Question = {
  id: string;
  disasterCategory: string;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  difficulty: "Easy" | "Medium" | "Hard";
  explanation: string;
};

const initialQuestions: Question[] = [
  {
    id: "q1",
    disasterCategory: "Earthquake",
    question: "What should you do during an earthquake?",
    options: [
      { label: "A", text: "Run outside immediately" },
      { label: "B", text: "Drop, Cover and Hold" },
      { label: "C", text: "Stand near a window" },
      { label: "D", text: "Use an elevator" },
    ],
    correctAnswer: "B",
    difficulty: "Easy",
    explanation: "Dropping, covering under a sturdy object, and holding on prevents you from being knocked down and protects from falling debris."
  },
  {
    id: "q2",
    disasterCategory: "Flood",
    question: "How much flowing water does it take to carry away a typical car?",
    options: [
      { label: "A", text: "6 inches" },
      { label: "B", text: "1 foot" },
      { label: "C", text: "2 feet" },
      { label: "D", text: "3 feet" },
    ],
    correctAnswer: "C",
    difficulty: "Medium",
    explanation: "Just 2 feet of rushing water can carry away most vehicles, including SUVs and pickups."
  }
];

export default function ManageQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [expanded, setExpanded] = useState<string[]>(["q1"]);

  const toggleExpand = (id: string) => {
    if (expanded.includes(id)) {
      setExpanded(expanded.filter(e => e !== id));
    } else {
      setExpanded([...expanded, id]);
    }
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6 pb-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#111827]">Quiz Questions</h1>
          <p className="text-sm text-[#6B7280]">Manage assessment content</p>
        </div>
        <button className="flex items-center gap-1 rounded-xl bg-[#10B981] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0E9F6E] transition">
          <Plus size={16} />
          Create Question
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
          <select className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#111827] focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]">
            <option value="all">All Disasters</option>
            <option value="earthquake">Earthquake</option>
            <option value="flood">Flood</option>
            <option value="fire">Fire</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" size={16} />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
            <div 
              className="flex cursor-pointer items-start justify-between bg-white p-4"
              onClick={() => toggleExpand(q.id)}
            >
              <div className="flex items-start gap-3 flex-1 pr-4">
                <div className={`mt-1 transition-transform duration-200 ${expanded.includes(q.id) ? 'rotate-180' : ''}`}>
                  <ChevronDown size={18} className="text-[#6B7280]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-semibold text-[#4B5563] uppercase tracking-wider">
                      {q.disasterCategory}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      q.difficulty === 'Easy' ? 'bg-[#D1FAE5] text-[#047857]' : 
                      q.difficulty === 'Medium' ? 'bg-[#FEF3C7] text-[#B45309]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#111827] leading-tight">{q.question}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button 
                  className="rounded p-1.5 text-[#6B7280] hover:bg-[#F3F4F6]"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="rounded p-1.5 text-[#EF4444] hover:bg-[#FEF2F2]"
                  onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {expanded.includes(q.id) && (
              <div className="border-t border-[#F3F4F6] bg-[#F9FAFB] p-4 text-sm">
                <div className="space-y-2 mb-4">
                  {q.options.map((opt) => (
                    <div 
                      key={opt.label} 
                      className={`flex items-center gap-3 rounded-lg border p-2 ${opt.label === q.correctAnswer ? 'border-[#10B981] bg-[#ECFDF5]' : 'border-[#E5E7EB] bg-white'}`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${opt.label === q.correctAnswer ? 'bg-[#10B981] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                        {opt.label}
                      </span>
                      <span className={`font-medium ${opt.label === q.correctAnswer ? 'text-[#047857]' : 'text-[#374151]'}`}>
                        {opt.text}
                      </span>
                      {opt.label === q.correctAnswer && <CheckCircle2 size={16} className="ml-auto text-[#10B981]" />}
                    </div>
                  ))}
                </div>
                
                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3">
                  <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Explanation</span>
                  <p className="text-sm text-[#4B5563]">{q.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
