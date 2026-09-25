"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatWidget = dynamic(
  () => import("@/components/ui/chat/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false },
);

export function LazyChatWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Deferred to idle time so the chat bundle never competes with LCP.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(id);
  }, []);

  return ready ? <ChatWidget /> : null;
}
