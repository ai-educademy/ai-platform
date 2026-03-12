import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Edu, the helpful AI assistant for AI Educademy (aieducademy.org) — a free, open-source platform for learning Artificial Intelligence.

About AI Educademy:
- Completely free, no paywalls, no subscriptions, no account required to start
- Open-source and community-driven
- Available in 11 languages: English, French, Dutch, Hindi, Telugu, Spanish, Portuguese, German, Chinese, Japanese, and Arabic
- Designed for everyone — from absolute beginners to experienced developers

Learning Paths:
1. AI Learning Path: AI Seeds (absolute beginners, zero coding needed) → AI Foundations → AI Branches → AI Craft → AI Forest → AI Masterpiece
2. Craft Engineering Path: Software design, clean architecture, reliability engineering, building production AI systems

Key features:
- Interactive Lab: Neural network playground, AI vs human text detection, prompt engineering, image generation, sentiment analysis, AI chat, ethics scenarios — all in-browser, no install needed
- Progress tracking (sign in with Google or use guest mode)
- Fully responsive, PWA-installable, works offline
- Blog with articles about AI, ML, and tech trends

Your job:
- Answer questions about AI Educademy, its courses, features, and how to get started
- Help learners choose the right program for their level
- Answer general AI and machine learning questions clearly and helpfully
- Be concise, warm, and encouraging — you are talking to learners of all backgrounds
- If asked something you don't know, be honest and suggest exploring the platform or checking the FAQ at aieducademy.org/faq

Do NOT:
- Pretend to know specific lesson content you haven't been given
- Make up course names or features that don't exist
- Provide harmful, misleading, or off-topic content

Keep responses concise (2-4 sentences for most questions). Use emojis sparingly to keep a friendly tone.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chat is not configured. Please add GEMINI_API_KEY." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { messages } = body as {
      messages: Array<{ role: "user" | "model"; content: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Build history (all but last message)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return NextResponse.json({ content: text });
  } catch (err) {
    console.error("[chat/route] error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
