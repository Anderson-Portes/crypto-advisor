"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Maximize2, ChevronDown } from "lucide-react";
import { sendChat } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "O que é DeFi?",
  "Como funciona o Bitcoin?",
  "O que são NFTs?",
  "Como diversificar em cripto?",
  "Quais são os riscos?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o **CryptoAdvisor**, seu assistente de criptomoedas. Posso te ajudar com dúvidas sobre Bitcoin, Ethereum, DeFi, NFTs e muito mais. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChat(msg, history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao conectar com o backend. Verifique se o servidor está rodando." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function renderContent(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br/>");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all"
        title="Abrir assistente"
      >
        <Bot className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/40 transition-all duration-300 ${
        minimized ? "w-72 h-14" : "w-96 h-[560px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--border)] rounded-t-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/10">
        <div className="p-1.5 bg-blue-500/20 rounded-full">
          <Bot className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">CryptoAdvisor IA</p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            Online · Gemini
          </p>
        </div>
        <button onClick={() => setMinimized((v) => !v)} className="text-[var(--text-secondary)] hover:text-white p-1 transition-colors">
          {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:text-white p-1 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-sm"
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                />
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-3 h-3 text-blue-400" />
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((n) => (
                      <div
                        key={n}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${n * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-[var(--border)]">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Pergunte sobre criptomoedas..."
                rows={1}
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-white placeholder-[var(--text-secondary)] resize-none focus:outline-none focus:border-blue-500 transition-colors max-h-24"
                style={{ minHeight: "38px" }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="p-2 bg-blue-500 rounded-xl text-white hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
