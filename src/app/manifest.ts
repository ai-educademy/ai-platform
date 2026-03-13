import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Educademy",
    short_name: "AI Educademy",
    description:
      "Free, multilingual AI education platform. Learn Artificial Intelligence from scratch through interactive lessons, hands-on experiments, and real-world projects.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0a1e",
    theme_color: "#6366f1",
    orientation: "any",
    categories: ["education", "technology"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Programs",
        short_name: "Programs",
        description: "Browse AI learning programs",
        url: "/programs",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "AI Lab",
        short_name: "Lab",
        description: "Experiment in the AI playground",
        url: "/lab",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Blog",
        short_name: "Blog",
        description: "Read AI education articles",
        url: "/blog",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
    screenshots: [
      {
        src: "/social-preview.png",
        sizes: "1280x640",
        type: "image/png",
        label: "AI Educademy homepage",
      },
    ],
  };
}
