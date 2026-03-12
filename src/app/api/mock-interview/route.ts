import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

type InterviewType = "behavioral" | "technical" | "system-design";
type InterviewStage = "question" | "feedback";

interface HistoryEntry {
  role: "user" | "model";
  content: string;
}

interface MockInterviewRequest {
  type: InterviewType;
  message: string;
  history: HistoryEntry[];
  stage: InterviewStage;
}

function getSystemPrompt(type: InterviewType, stage: InterviewStage): string {
  if (stage === "question") {
    const typeInstructions: Record<InterviewType, string> = {
      behavioral:
        "Ask behavioral interview questions using the STAR method (Situation, Task, Action, Result). " +
        "Focus on leadership, teamwork, conflict resolution, and problem-solving experiences.",
      technical:
        "Ask technical interview questions about coding, algorithms, data structures, and problem-solving. " +
        "Present one clear coding or algorithm challenge at a time.",
      "system-design":
        "Ask system design interview questions about architecture, scalability, reliability, and trade-offs. " +
        "Present one system to design at a time (e.g., design a URL shortener, design a chat system).",
    };

    return (
      "You are an experienced tech interviewer at a top technology company. " +
      "Ask one question at a time. Be professional but friendly. " +
      `${typeInstructions[type]} ` +
      "Do not provide the answer — only ask the question. " +
      "If this is the start of the interview, briefly introduce yourself and the interview format before asking the first question."
    );
  }

  return (
    "You are an experienced tech interviewer providing feedback on a candidate's answer. " +
    "Evaluate the answer and provide specific, actionable feedback. " +
    "Rate the answer on a scale of 1–5 for each of these criteria:\n" +
    "- **Clarity**: How clearly the answer was communicated\n" +
    "- **Depth**: How thorough and detailed the answer was\n" +
    "- **Relevance**: How well the answer addressed the question\n\n" +
    "Format your ratings as: Clarity: X/5 | Depth: X/5 | Relevance: X/5\n\n" +
    "Then provide:\n" +
    "1. What was done well\n" +
    "2. Specific improvements to make\n" +
    "3. A brief example of a stronger answer element\n\n" +
    "Be encouraging but honest."
  );
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Mock interview is not configured. Please add GEMINI_API_KEY." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as MockInterviewRequest;
    const { type, message, history, stage } = body;

    if (!type || !message || !stage) {
      return NextResponse.json(
        { error: "Invalid request. Required: type, message, stage." },
        { status: 400 }
      );
    }

    const validTypes: InterviewType[] = ["behavioral", "technical", "system-design"];
    const validStages: InterviewStage[] = ["question", "feedback"];

    if (!validTypes.includes(type) || !validStages.includes(stage)) {
      return NextResponse.json(
        { error: "Invalid type or stage." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: getSystemPrompt(type, stage),
    });

    const chatHistory = (history ?? []).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return NextResponse.json({ content: text });
  } catch (err: unknown) {
    console.error("[mock-interview/route] error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("quota")
    ) {
      return NextResponse.json(
        {
          error:
            "The interviewer is taking a short break due to high demand 🙏 Please try again in a minute.",
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
