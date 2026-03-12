import { ImageResponse } from "next/og";
import { getProgram } from "@/lib/programs";
import enMessages from "../../../../../messages/en.json";

export const alt = "AI Educademy Program";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const levelLabels: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

type ProgramMessages = Record<
  string,
  { title?: string; subtitle?: string; description?: string }
>;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; programSlug: string }>;
}) {
  const { programSlug } = await params;
  const program = getProgram(programSlug);

  const programs = (enMessages as { programs?: ProgramMessages }).programs || {};
  const programText = programs[programSlug];

  const title = programText?.title || programSlug.replace(/-/g, " ");
  const subtitle = programText?.subtitle || "";
  const description = programText?.description || "";
  const icon = program?.icon || "📚";
  const level = program?.level || 0;
  const levelLabel = levelLabels[level] || "";
  const color = program?.color || "#6366f1";
  const hours = program?.estimatedHours || 0;

  const descriptionExcerpt =
    description.length > 140 ? description.slice(0, 140) + "…" : description;

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

        {/* Top: Branding + Program badge */}
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
            Program
          </div>
        </div>

        {/* Middle: Program info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Icon + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: `${color}33`,
                border: `3px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
              }}
            >
              {icon}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  display: "flex",
                }}
              >
                {title}
              </div>
              {subtitle && (
                <div
                  style={{
                    fontSize: 22,
                    color: "rgba(255, 255, 255, 0.7)",
                    display: "flex",
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {descriptionExcerpt && (
            <div
              style={{
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.5,
                marginTop: 8,
                maxWidth: "85%",
                display: "flex",
              }}
            >
              {descriptionExcerpt}
            </div>
          )}
        </div>

        {/* Bottom: Level + Hours */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          {levelLabel && (
            <div
              style={{
                background: `${color}33`,
                borderRadius: 16,
                padding: "6px 18px",
                fontSize: 16,
                color,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Level {level}: {levelLabel}
            </div>
          )}
          {hours > 0 && (
            <div
              style={{
                fontSize: 16,
                color: "rgba(255, 255, 255, 0.5)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ⏱ ~{hours} hours
            </div>
          )}
          <div
            style={{
              marginLeft: "auto",
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.4)",
              display: "flex",
            }}
          >
            aieducademy.org
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
