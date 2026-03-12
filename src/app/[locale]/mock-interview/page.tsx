"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

/* ─── Types ─── */

type InterviewType = "behavioral" | "technical" | "system-design";
type Phase = "setup" | "interview" | "summary";

interface Message {
  role: "user" | "model";
  content: string;
}

interface Ratings {
  clarity: number;
  depth: number;
  relevance: number;
}

interface QuestionRound {
  question: string;
  answer: string;
  feedback: string;
  ratings: Ratings;
}

/* ─── Constants ─── */

const TOTAL_QUESTIONS = 5;

/* ─── Helpers ─── */

function parseRatings(feedback: string): Ratings {
  const extract = (label: string): number => {
    const pattern = new RegExp(`${label}[:\\s]*(\\d)`, "i");
    const match = feedback.match(pattern);
    return match ? Math.min(5, Math.max(1, parseInt(match[1], 10))) : 3;
  };
  return {
    clarity: extract("Clarity"),
    depth: extract("Depth"),
    relevance: extract("Relevance"),
  };
}

function averageRatings(rounds: QuestionRound[]): Ratings {
  if (rounds.length === 0) return { clarity: 0, depth: 0, relevance: 0 };
  const sum = rounds.reduce(
    (acc, r) => ({
      clarity: acc.clarity + r.ratings.clarity,
      depth: acc.depth + r.ratings.depth,
      relevance: acc.relevance + r.ratings.relevance,
    }),
    { clarity: 0, depth: 0, relevance: 0 }
  );
  return {
    clarity: Math.round((sum.clarity / rounds.length) * 10) / 10,
    depth: Math.round((sum.depth / rounds.length) * 10) / 10,
    relevance: Math.round((sum.relevance / rounds.length) * 10) / 10,
  };
}

/* ─── Stars component ─── */

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={i < Math.round(rating) ? "text-yellow-400" : "text-white/20"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/* ─── Animated dots loading ─── */

function LoadingDots({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {text}
      <span className="inline-flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
      </span>
    </span>
  );
}

/* ─── Main Component ─── */

export default function MockInterviewPage() {
  const t = useTranslations("mockInterview");

  const [phase, setPhase] = useState<Phase>("setup");
  const [interviewType, setInterviewType] = useState<InterviewType>("behavioral");
  const [history, setHistory] = useState<Message[]>([]);
  const [rounds, setRounds] = useState<QuestionRound[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [currentRatings, setCurrentRatings] = useState<Ratings | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"question" | "feedback">("question");
  const [error, setError] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const typeCards: {
    type: InterviewType;
    icon: string;
    titleKey: string;
    descKey: string;
    gradient: string;
  }[] = [
    {
      type: "behavioral",
      icon: "💬",
      titleKey: "behavioral",
      descKey: "behavioralDesc",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      type: "technical",
      icon: "💻",
      titleKey: "technical",
      descKey: "technicalDesc",
      gradient: "from-violet-500/20 to-purple-500/20",
    },
    {
      type: "system-design",
      icon: "🏗️",
      titleKey: "systemDesign",
      descKey: "systemDesignDesc",
      gradient: "from-amber-500/20 to-orange-500/20",
    },
  ];

  const callAPI = useCallback(
    async (
      stage: "question" | "feedback",
      message: string,
      chatHistory: Message[]
    ): Promise<string> => {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: interviewType,
          message,
          history: chatHistory,
          stage,
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      return data.content ?? "";
    },
    [interviewType]
  );

  const startInterview = useCallback(async () => {
    setLoading(true);
    setLoadingType("question");
    setError("");
    try {
      const question = await callAPI(
        "question",
        `Start a ${interviewType} interview. Ask the first question.`,
        []
      );
      const newHistory: Message[] = [
        { role: "user", content: `Start a ${interviewType} interview.` },
        { role: "model", content: question },
      ];
      setHistory(newHistory);
      setCurrentQuestion(question);
      setQuestionIndex(0);
      setPhase("interview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
    } finally {
      setLoading(false);
    }
  }, [callAPI, interviewType]);

  const submitAnswer = useCallback(async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setLoadingType("feedback");
    setError("");
    try {
      const updatedHistory: Message[] = [
        ...history,
        { role: "user", content: userAnswer },
      ];
      const feedback = await callAPI("feedback", userAnswer, updatedHistory);
      const ratings = parseRatings(feedback);
      setCurrentFeedback(feedback);
      setCurrentRatings(ratings);
      setShowFeedback(true);
      setHistory([...updatedHistory, { role: "model", content: feedback }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setLoading(false);
    }
  }, [userAnswer, history, callAPI]);

  const nextQuestion = useCallback(async () => {
    const newIndex = questionIndex + 1;

    if (newIndex >= TOTAL_QUESTIONS) {
      // Save final round and go to summary
      setRounds((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answer: userAnswer,
          feedback: currentFeedback,
          ratings: currentRatings ?? { clarity: 3, depth: 3, relevance: 3 },
        },
      ]);
      setPhase("summary");
      return;
    }

    setRounds((prev) => [
      ...prev,
      {
        question: currentQuestion,
        answer: userAnswer,
        feedback: currentFeedback,
        ratings: currentRatings ?? { clarity: 3, depth: 3, relevance: 3 },
      },
    ]);

    setLoading(true);
    setLoadingType("question");
    setError("");
    setShowFeedback(false);
    setUserAnswer("");
    setCurrentFeedback("");
    setCurrentRatings(null);

    try {
      const question = await callAPI(
        "question",
        "Ask the next interview question.",
        history
      );
      setHistory((prev) => [
        ...prev,
        { role: "user", content: "Next question please." },
        { role: "model", content: question },
      ]);
      setCurrentQuestion(question);
      setQuestionIndex(newIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get next question");
    } finally {
      setLoading(false);
    }
  }, [
    questionIndex,
    currentQuestion,
    userAnswer,
    currentFeedback,
    currentRatings,
    history,
    callAPI,
  ]);

  const resetInterview = useCallback(() => {
    setPhase("setup");
    setHistory([]);
    setRounds([]);
    setCurrentQuestion("");
    setUserAnswer("");
    setCurrentFeedback("");
    setCurrentRatings(null);
    setQuestionIndex(0);
    setShowFeedback(false);
    setError("");
  }, []);

  const shareResults = useCallback(async () => {
    const avg = averageRatings(rounds);
    const overall = ((avg.clarity + avg.depth + avg.relevance) / 3).toFixed(1);
    const text = `🎯 AI Mock Interview Results\n\nType: ${interviewType}\nOverall Score: ${overall}/5\nClarity: ${avg.clarity}/5 | Depth: ${avg.depth}/5 | Relevance: ${avg.relevance}/5\n\nPractice at aieducademy.org`;
    if (navigator.share) {
      await navigator.share({ title: "Mock Interview Results", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, [rounds, interviewType]);

  /* ─── Setup Phase ─── */
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-6">
              <span>🎯</span>
              <span>AI-Powered Practice</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          {/* Interview Type Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {typeCards.map((card) => (
              <button
                key={card.type}
                onClick={() => setInterviewType(card.type)}
                className={`relative group text-left p-6 rounded-2xl border transition-all duration-300 ${
                  interviewType === card.type
                    ? "border-white/30 bg-white/10 shadow-lg shadow-white/5 scale-[1.02]"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative">
                  <span className="text-3xl mb-3 block">{card.icon}</span>
                  <h3 className="font-semibold text-lg mb-1">
                    {t(card.titleKey)}
                  </h3>
                  <p className="text-sm text-white/50">{t(card.descKey)}</p>
                  {interviewType === card.type && (
                    <div className="mt-3 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={startInterview}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingDots text={t("thinking")} />
              ) : (
                <>
                  <span>🎙️</span>
                  {t("startInterview")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Summary Phase ─── */
  if (phase === "summary") {
    const avg = averageRatings(rounds);
    const overall =
      Math.round(((avg.clarity + avg.depth + avg.relevance) / 3) * 10) / 10;

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {t("interviewComplete")}
            </h1>
            <p className="text-white/50">
              {t("questionOf", { current: TOTAL_QUESTIONS, total: TOTAL_QUESTIONS })}
            </p>
          </div>

          {/* Overall Score */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 mb-8 text-center">
            <h2 className="text-lg font-semibold text-white/70 mb-4">
              {t("overallScore")}
            </h2>
            <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6">
              {overall}/5
            </div>
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              {(["clarity", "depth", "relevance"] as const).map((key) => (
                <div key={key}>
                  <div className="text-sm text-white/50 mb-1">{t(key)}</div>
                  <div className="text-xl font-bold mb-1">{avg[key]}</div>
                  <Stars rating={avg[key]} />
                </div>
              ))}
            </div>
          </div>

          {/* Per-question breakdown */}
          <div className="space-y-4 mb-10">
            {rounds.map((round, i) => (
              <details
                key={i}
                className="group rounded-xl bg-white/5 border border-white/10 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors">
                  <span className="font-medium">
                    {t("questionOf", { current: i + 1, total: TOTAL_QUESTIONS })}
                  </span>
                  <div className="flex items-center gap-3">
                    <Stars
                      rating={
                        (round.ratings.clarity +
                          round.ratings.depth +
                          round.ratings.relevance) /
                        3
                      }
                    />
                    <span className="text-white/30 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </div>
                </summary>
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                    <span className="font-medium text-blue-400">🤖 Question: </span>
                    <span className="text-white/80">{round.question}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-sm">
                    <span className="font-medium text-violet-400">You: </span>
                    <span className="text-white/80">{round.answer}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm whitespace-pre-wrap">
                    <span className="text-white/80">{round.feedback}</span>
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={resetInterview}
              className="px-8 py-3 rounded-xl font-semibold border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
            >
              {t("tryAgain")}
            </button>
            <button
              onClick={shareResults}
              className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
            >
              {t("shareResults")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Interview Phase ─── */
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h1 className="text-xl font-bold">{t("title")}</h1>
              <p className="text-sm text-white/50">
                {t(
                  interviewType === "behavioral"
                    ? "behavioral"
                    : interviewType === "technical"
                      ? "technical"
                      : "systemDesign"
                )}
              </p>
            </div>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60">
            {t("questionOf", {
              current: questionIndex + 1,
              total: TOTAL_QUESTIONS,
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full bg-white/10 mb-8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
            style={{
              width: `${((questionIndex + (showFeedback ? 1 : 0.5)) / TOTAL_QUESTIONS) * 100}%`,
            }}
          />
        </div>

        {/* Interviewer Question */}
        <div className="flex gap-3 mb-6">
          <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">
            🤖
          </div>
          <div className="flex-1 p-4 rounded-2xl rounded-tl-md bg-blue-500/10 border border-blue-500/20">
            {loading && loadingType === "question" ? (
              <LoadingDots text={t("thinking")} />
            ) : (
              <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                {currentQuestion}
              </div>
            )}
          </div>
        </div>

        {/* User Answer */}
        {!showFeedback && !loading && (
          <div className="flex gap-3 mb-6 flex-row-reverse">
            <div className="shrink-0 w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-lg">
              👤
            </div>
            <div className="flex-1">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t("typeYourAnswer")}
                rows={6}
                className="w-full p-4 rounded-2xl rounded-tr-md bg-violet-500/10 border border-violet-500/20 text-white placeholder:text-white/30 resize-y focus:outline-none focus:border-violet-500/40 transition-colors"
              />
            </div>
          </div>
        )}

        {/* User answer display (after submission) */}
        {showFeedback && (
          <div className="flex gap-3 mb-6 flex-row-reverse">
            <div className="shrink-0 w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-lg">
              👤
            </div>
            <div className="flex-1 p-4 rounded-2xl rounded-tr-md bg-violet-500/10 border border-violet-500/20">
              <div className="text-white/90 whitespace-pre-wrap">{userAnswer}</div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && currentFeedback && (
          <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📝</span>
              <span className="font-semibold text-green-400">{t("getFeedback")}</span>
            </div>
            {currentRatings && (
              <div className="flex flex-wrap gap-4 mb-4 p-3 rounded-lg bg-white/5">
                {(["clarity", "depth", "relevance"] as const).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-sm text-white/50">{t(key)}:</span>
                    <Stars rating={currentRatings[key]} />
                  </div>
                ))}
              </div>
            )}
            <div className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm">
              {currentFeedback}
            </div>
          </div>
        )}

        {/* Loading feedback */}
        {loading && loadingType === "feedback" && (
          <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 mb-6">
            <LoadingDots text={t("analyzing")} />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {!showFeedback && !loading && (
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {t("submitAnswer")}
            </button>
          )}
          {showFeedback && (
            <button
              onClick={nextQuestion}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
            >
              {questionIndex + 1 >= TOTAL_QUESTIONS
                ? t("interviewComplete")
                : t("nextQuestion")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
