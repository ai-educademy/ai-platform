import Link from "next/link";

const popularPages = [
  { href: "/programs", label: "Programs" },
  { href: "/blog", label: "Blog" },
  { href: "/lab", label: "AI Lab" },
  { href: "/about", label: "About" },
];

export default function RootNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "system-ui, sans-serif",
        background: "#09090b",
        color: "#fafafa",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div style={{ fontSize: "6rem", fontWeight: 800, color: "#818cf8", opacity: 0.15, lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          Page not found
        </h1>
        <p style={{ color: "#a1a1aa", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            background: "#6366f1",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.75rem",
            fontWeight: 600,
            fontSize: "1rem",
            transition: "filter 0.2s",
          }}
        >
          Go Home
        </Link>

        <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid #27272a" }}>
          <p style={{ color: "#a1a1aa", fontSize: "0.875rem", marginBottom: "0.75rem", fontWeight: 500 }}>
            Popular pages
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {popularPages.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#18181b",
                  color: "#818cf8",
                  textDecoration: "none",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  border: "1px solid #27272a",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
