import { ImageResponse } from "next/og";
import { getBlogPost } from "@/lib/blog";

export const alt = "AI Educademy Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug, locale);

  const title = post?.title || "AI Educademy Blog";
  const author = post?.author || "AI Educademy Team";
  const date = post?.date
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const tags = post?.tags?.slice(0, 3) || [];

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          padding: "60px 64px",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.2)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(52, 211, 153, 0.15)",
            display: "flex",
          }}
        />

        {/* Top: Branding + Blog label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              🎓
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                display: "flex",
              }}
            >
              AI Educademy
            </span>
          </div>
          <div
            style={{
              background: "rgba(99, 102, 241, 0.3)",
              borderRadius: 20,
              padding: "6px 20px",
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.8)",
              display: "flex",
            }}
          >
            Blog
          </div>
        </div>

        {/* Middle: Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? 40 : 48,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              display: "flex",
              maxWidth: "90%",
            }}
          >
            {title}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    background: "rgba(52, 211, 153, 0.2)",
                    borderRadius: 16,
                    padding: "4px 14px",
                    fontSize: 15,
                    color: "#34d399",
                    display: "flex",
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: Author + Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "white",
              }}
            >
              ✍
            </div>
            <span
              style={{
                fontSize: 18,
                color: "rgba(255, 255, 255, 0.8)",
                display: "flex",
              }}
            >
              {author}
            </span>
          </div>
          {date && (
            <span
              style={{
                fontSize: 18,
                color: "rgba(255, 255, 255, 0.5)",
                display: "flex",
              }}
            >
              {date}
            </span>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
