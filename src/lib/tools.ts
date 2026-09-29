import type { Region } from "@/lib/geo";

export type ToolCategory =
  | "chat"
  | "devtools"
  | "cloud"
  | "data"
  | "automation"
  | "learning";

export const TOOL_CATEGORIES: ToolCategory[] = [
  "chat",
  "devtools",
  "cloud",
  "data",
  "automation",
  "learning",
];

export interface Tool {
  id: string;
  name: string;
  /** Short, factual English description. Proper-noun product copy is not translated. */
  blurb: string;
  category: ToolCategory;
  /** Canonical product URL, used when no region affiliate link is set. */
  url: string;
  /**
   * Region-specific referral links. Fill these with real affiliate URLs as
   * programmes are joined; until then the canonical {@link url} is used, so no
   * placeholder or fake tracking IDs ship. A `GLOBAL` entry applies everywhere.
   */
  affiliate?: Partial<Record<Region, string>>;
  /**
   * Markets where this offer is especially relevant. Omit for a globally
   * relevant tool. Used to order and lightly filter the directory by country.
   */
  regions?: Region[];
  /** Short label such as "Free tier" or "Student discount". */
  badge?: string;
  /** Emoji marker shown on the card. */
  icon: string;
  featured?: boolean;
}

/**
 * A curated directory of tools used across the academies.
 *
 * Every entry links to the real product. Affiliate links are added per region as
 * programmes are approved; the resolver falls back to the plain URL so the page
 * is useful and honest from day one.
 */
export const TOOLS: Tool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    blurb: "OpenAI's assistant for writing, coding and reasoning. A generous free tier to start.",
    category: "chat",
    url: "https://openai.com/chatgpt",
    badge: "Free tier",
    icon: "💬",
    featured: true,
  },
  {
    id: "claude",
    name: "Claude",
    blurb: "Anthropic's assistant, strong at long documents and careful reasoning.",
    category: "chat",
    url: "https://www.anthropic.com/claude",
    badge: "Free tier",
    icon: "🧠",
    featured: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    blurb: "Google's multimodal assistant, tied into Search and Workspace.",
    category: "chat",
    url: "https://gemini.google.com",
    badge: "Free tier",
    icon: "✨",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    blurb: "Answer engine that cites its sources. Good for research and quick facts.",
    category: "chat",
    url: "https://www.perplexity.ai",
    badge: "Free tier",
    icon: "🔎",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    blurb: "AI pair programmer in your editor. Free for verified students and teachers.",
    category: "devtools",
    url: "https://github.com/features/copilot",
    badge: "Student free",
    icon: "🤖",
    featured: true,
  },
  {
    id: "cursor",
    name: "Cursor",
    blurb: "An editor built around AI, with codebase-aware chat and edits.",
    category: "devtools",
    url: "https://cursor.com",
    badge: "Free tier",
    icon: "⌨️",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    blurb: "The hub for open models, datasets and demos. Essential for practitioners.",
    category: "devtools",
    url: "https://huggingface.co",
    badge: "Free tier",
    icon: "🤗",
  },
  {
    id: "langchain",
    name: "LangChain",
    blurb: "Framework for building apps on top of language models.",
    category: "devtools",
    url: "https://www.langchain.com",
    icon: "🔗",
  },
  {
    id: "colab",
    name: "Google Colab",
    blurb: "Notebooks with free GPUs in the browser. Ideal for learning and prototyping.",
    category: "cloud",
    url: "https://colab.research.google.com",
    badge: "Free tier",
    icon: "📓",
  },
  {
    id: "runpod",
    name: "RunPod",
    blurb: "Rent GPUs by the minute for training and inference. Pay only for what you use.",
    category: "cloud",
    url: "https://www.runpod.io",
    icon: "⚡",
  },
  {
    id: "lambda",
    name: "Lambda",
    blurb: "GPU cloud and workstations aimed at deep learning teams.",
    category: "cloud",
    url: "https://lambdalabs.com",
    icon: "🖥️",
  },
  {
    id: "pinecone",
    name: "Pinecone",
    blurb: "Managed vector database for retrieval-augmented generation. Free starter tier.",
    category: "data",
    url: "https://www.pinecone.io",
    badge: "Free tier",
    icon: "🌲",
  },
  {
    id: "weaviate",
    name: "Weaviate",
    blurb: "Open-source vector database you can self-host or run in the cloud.",
    category: "data",
    url: "https://weaviate.io",
    icon: "🧩",
  },
  {
    id: "n8n",
    name: "n8n",
    blurb: "Open-source workflow automation you can wire into AI steps.",
    category: "automation",
    url: "https://n8n.io",
    icon: "⚙️",
  },
  {
    id: "zapier",
    name: "Zapier",
    blurb: "Connect thousands of apps and add AI actions without code.",
    category: "automation",
    url: "https://zapier.com",
    badge: "Free tier",
    icon: "🔌",
  },
  {
    id: "datacamp",
    name: "DataCamp",
    blurb: "Interactive data and AI courses. Frequent student and regional discounts.",
    category: "learning",
    url: "https://www.datacamp.com",
    badge: "Student discount",
    icon: "🎓",
  },
  {
    id: "coursera",
    name: "Coursera",
    blurb: "University and industry AI certificates, with financial aid in many markets.",
    category: "learning",
    url: "https://www.coursera.org",
    icon: "📜",
  },
];

/** The link to open for a tool, preferring a region-specific affiliate URL. */
export function resolveOfferUrl(tool: Tool, region: Region): string {
  return tool.affiliate?.[region] ?? tool.affiliate?.GLOBAL ?? tool.url;
}

/** Whether an offer is relevant to a region (offers without regions are global). */
export function isRelevant(tool: Tool, region: Region): boolean {
  return (
    !tool.regions ||
    tool.regions.includes(region) ||
    tool.regions.includes("GLOBAL")
  );
}

/**
 * Orders tools for a region: relevant and featured first, then the rest, with a
 * stable order within each group so the grid does not reshuffle arbitrarily.
 */
export function sortForRegion(tools: Tool[], region: Region): Tool[] {
  const score = (t: Tool) =>
    (isRelevant(t, region) ? 2 : 0) + (t.featured ? 1 : 0);
  return tools
    .map((tool, index) => ({ tool, index }))
    .sort((a, b) => score(b.tool) - score(a.tool) || a.index - b.index)
    .map(({ tool }) => tool);
}
