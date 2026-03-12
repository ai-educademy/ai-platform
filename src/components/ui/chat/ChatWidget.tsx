"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send, X, Minimize2, Maximize2, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "model",
  content:
    "Hi! I'm Edu 👋 — your AI Educademy assistant. Ask me anything about AI, our courses, or how to get started!",
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-br-sm"
            : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimised) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimised, messages, scrollToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.filter((m) => m.id !== "welcome").map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: `m-${Date.now()}`,
        role: "model",
        content: data.content ?? data.error ?? "Sorry, something went wrong.",
      };

      setMessages((prev) => [...prev, botMsg]);
      if (isMinimised || !isOpen) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          content: "Sorry, I couldn't connect. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isMinimised, isOpen]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const open = () => {
    setIsOpen(true);
    setIsMinimised(false);
    setHasUnread(false);
  };

  const close = () => {
    setIsOpen(false);
    setIsMinimised(false);
  };

  const toggleMinimise = () => setIsMinimised((v) => !v);

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={open}
          aria-label="Open chat assistant"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          <Bot className="w-6 h-6" />
          {hasUnread && (
            <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
          )}
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimised ? "h-14" : "h-[480px]"
          }`}
          role="dialog"
          aria-label="AI Educademy Chat Assistant"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-none">Edu</p>
              <p className="text-xs text-white/80 mt-0.5">AI Educademy Assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMinimise}
                aria-label={isMinimised ? "Expand chat" : "Minimise chat"}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isMinimised ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={close}
                aria-label="Close chat"
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimised && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-[var(--color-border)] flex-shrink-0">
                <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask me anything…"
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none disabled:opacity-50"
                    aria-label="Chat message input"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    aria-label="Send message"
                    className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-2">
                  Powered by Gemini · AI Educademy
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
