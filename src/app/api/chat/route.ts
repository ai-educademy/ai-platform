import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";
import { mapAiError } from "@/lib/ai-errors";
import { z } from "zod";

const ChatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1).max(4000),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
});

const SYSTEM_PROMPT = `You are Edu, the helpful AI assistant for AI Educademy (aieducademy.org), a platform for learning Artificial Intelligence and preparing for technical interviews.

About AI Educademy:
- Available in 11 languages: English, French, Dutch, Hindi, Telugu, Spanish, Portuguese, German, Chinese, Japanese, and Arabic
- Designed for everyone, from absolute beginners to experienced engineers

Pricing (be accurate about this, never claim the platform is entirely free):
- Explorer (free): the first lesson of every academy is free to preview, plus articles, programme previews and the interactive AI Lab. Progress is saved locally. No account needed to start.
- Pro: unlocks every remaining lesson, all academies and tracks, the Career Ready interview prep track, the AI Mock Interview lab, completion certificates, and progress sync across devices.
- Pro is available as a monthly, annual (saves 27% versus monthly) or one-off lifetime purchase. Direct anyone asking about prices to aieducademy.org/pricing rather than quoting figures.

Learning tracks:
1. AI Foundations: AI Seeds (absolute beginners, zero coding needed) → AI Sprouts → AI Branches → AI Canopy → AI Forest
2. AI Mastery: AI Sketch → AI Chisel → AI Craft → AI Polish → AI Masterpiece
3. Career Ready: Interview Launchpad → Behavioral Mastery → Technical Interviews → AI & ML Interviews → Offer & Beyond

Key features:
- Interactive Lab: neural network playground, AI vs human text detection, prompt engineering, sentiment analysis, sorting visualiser, tokeniser, ethics scenarios. All in-browser, no install needed
- Progress tracking (sign in with Google or use guest mode)
- Fully responsive, PWA-installable, works offline
- Blog with articles about AI, ML, and tech trends

Your job:
- Answer questions about AI Educademy, its academies, features, and how to get started
- Help learners choose the right programme for their level
- Answer general AI and machine learning questions clearly and helpfully
- Be concise, warm, and encouraging. You are talking to learners of all backgrounds
- If asked something you don't know, be honest and suggest exploring the platform or checking the FAQ at aieducademy.org/faq

Do NOT:
- Claim the platform is completely free, open-source, or has no paywalls. It has a free first-lesson preview and a paid Pro plan
- Quote specific prices or currency amounts. Point people to aieducademy.org/pricing
- Pretend to know specific lesson content you haven't been given
- Make up course names or features that don't exist
- Provide harmful, misleading, or off-topic content

Keep responses concise (2-4 sentences for most questions). Use emojis sparingly to keep a friendly tone.`;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`chat:${ip}`, RATE_LIMITS.ai);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before chatting again." },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chat is not configured. Please add GEMINI_API_KEY." },
        { status: 503 }
      );
    }

    const { messages } = parsed.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
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
  } catch (err: unknown) {
    console.error("[chat/route] error:", err);
    const { status, body } = mapAiError(err);
    return NextResponse.json(body, { status });
  }
}
