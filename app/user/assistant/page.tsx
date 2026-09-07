"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, User, Mic, Send, Droplet, AlertTriangle, Briefcase, CheckCircle2 } from "lucide-react";

const suggestions = [
  { label: "How to prepare for a flood?", icon: Droplet },
  { label: "Explain earthquake safety", icon: AlertTriangle },
  { label: "Emergency kit list", icon: Briefcase },
];

type Message = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: "I'm your Disaster Assistant. How can I help you prepare today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Load chat history from backend
    fetch("/api/assistant/history")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
          })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    // Add user message immediately
    const userMsg: Message = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      setIsTyping(false);

      if (res.ok && data.message) {
        const botMsg: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.message,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const botMsg: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm currently unable to retrieve disaster guidance. Please check your emergency services line or try again in a moment.",
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      setIsTyping(false);
      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Network error. Please verify your connection.",
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  return (
    <section className="flex flex-col animate-[fadeIn_0.5s_ease-out]">
      <div className="space-y-5 pb-4">
        {messages.map((msg, index) => {
          if (msg.sender === 'bot') {
            return (
              <div key={msg.id} className="flex items-start gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white">
                  <Bot size={16} />
                </span>
                <div>
                  <div className={`rounded-2xl rounded-tl-sm border ${index === 0 ? 'border-[#E5E7EB]' : 'border-l-4 border-[#10B981]'} bg-white px-4 py-3 text-sm leading-6 text-[#111827] shadow-sm whitespace-pre-wrap`}>
                    {msg.text}
                  </div>
                  <span className="mt-1.5 flex items-center gap-1 text-xs text-[#10B981]">
                    <CheckCircle2 size={12} /> Verified by Knowledge Graph
                  </span>
                </div>
              </div>
            );
          } else {
            return (
              <div key={msg.id} className="flex items-start justify-end gap-2">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#F3F4F6] px-4 py-3 text-sm leading-6 text-[#111827]">
                  {msg.text}
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-[#4F46E5]">
                  <User size={16} />
                </span>
              </div>
            );
          }
        })}

        {/* Suggestions only show if it's just the initial message */}
        {messages.length === 1 && (
          <div className="space-y-2 pl-10">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.label)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#F9FAFB]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#6366F1]">
                    <Icon size={15} />
                  </span>
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — fixed above bottom nav */}
      <div className="fixed inset-x-0 bottom-16 z-10 bg-[#F9FAFB] px-4 pb-2 pt-2">
        <div className="mx-auto max-w-md">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-sm"
          >
            <Mic size={18} className="shrink-0 text-[#9CA3AF]" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your disaster preparedness question"
              className="w-full bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white transition hover:bg-[#0E9F72] disabled:opacity-50 disabled:hover:bg-[#10B981]"
            >
              <Send size={15} />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] leading-tight text-[#9CA3AF]">
            SafeGraph AI can make mistakes. Consider verifying critical emergency information.
          </p>
        </div>
      </div>

      {/* Spacer so messages aren't hidden behind the fixed input bar */}
      <div className="h-28" />
    </section>
  );
}