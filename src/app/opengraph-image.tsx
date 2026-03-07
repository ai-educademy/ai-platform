import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AI Educademy — Free AI Education for Everyone";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
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

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            🎓
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          AI Educademy
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: 16,
            display: "flex",
          }}
        >
          Free AI Education for Everyone
        </div>

        {/* Features bar */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: 20,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            🌍 5 Languages
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            💝 100% Free
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            🔓 Open Source
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            🧪 Hands-on
          </span>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "rgba(255, 255, 255, 0.5)",
            display: "flex",
          }}
        >
          aieducademy.org
        </div>
      </div>
    ),
    { ...size }
  );
}
