"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Trophy, Download, Share2, X } from "lucide-react";

interface CertificateProps {
  programName: string;
  programIcon: string;
  userName: string;
  completionDate: string;
  onClose: () => void;
}

function drawCertificate(
  canvas: HTMLCanvasElement,
  programName: string,
  programIcon: string,
  userName: string,
  completionDate: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 800;
  const H = 600;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Outer decorative border
  const grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, "#6366f1");
  grd.addColorStop(0.5, "#8b5cf6");
  grd.addColorStop(1, "#ec4899");
  ctx.strokeStyle = grd;
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  // Inner border
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // Trophy icon
  ctx.font = "48px serif";
  ctx.textAlign = "center";
  ctx.fillText("🏆", W / 2, 90);

  // Title
  ctx.font = "bold 32px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#1e1b4b";
  ctx.fillText("Certificate of Completion", W / 2, 145);

  // Decorative line
  const lineGrd = ctx.createLinearGradient(200, 0, 600, 0);
  lineGrd.addColorStop(0, "#6366f1");
  lineGrd.addColorStop(1, "#ec4899");
  ctx.strokeStyle = lineGrd;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 165);
  ctx.lineTo(550, 165);
  ctx.stroke();

  // "This certifies that"
  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("This certifies that", W / 2, 210);

  // User name
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#1e1b4b";
  ctx.fillText(userName, W / 2, 255);

  // "has successfully completed"
  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("has successfully completed", W / 2, 300);

  // Program icon + name
  ctx.font = "36px serif";
  ctx.fillText(programIcon, W / 2, 350);
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#4f46e5";
  ctx.fillText(programName, W / 2, 390);

  // Date
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(`Completed on ${completionDate}`, W / 2, 440);

  // Branding
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#1e1b4b";
  ctx.fillText("Open AI School", W / 2, 520);
  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText("openai.school", W / 2, 545);
}

export function Certificate({ programName, programIcon, userName, completionDate, onClose }: CertificateProps) {
  const t = useTranslations("dashboard");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [drawn, setDrawn] = useState(false);

  const canvasCallback = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (node && !drawn) {
        (canvasRef as React.MutableRefObject<HTMLCanvasElement>).current = node;
        drawCertificate(node, programName, programIcon, userName, completionDate);
        setDrawn(true);
      }
    },
    [programName, programIcon, userName, completionDate, drawn],
  );

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${programName.replace(/\s+/g, "-")}-certificate.png`;
    a.click();
  };

  const handleShare = async () => {
    const text = `I completed ${programName} on Open AI School! 🎓`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[860px] bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border)] shadow-2xl p-6 space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-bg-section)] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={20} className="text-[var(--color-text-muted)]" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-gradient">
            <Trophy size={28} className="text-yellow-500" />
            {t("certificateTitle")}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center overflow-auto">
          <canvas
            ref={canvasCallback}
            className="rounded-xl border border-[var(--color-border)] max-w-full h-auto"
            style={{ width: 800, height: 600 }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Download size={18} />
            {t("downloadCertificate")}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--color-border)] rounded-xl font-semibold hover:bg-[var(--color-bg-section)] transition-all cursor-pointer"
          >
            <Share2 size={18} />
            {copied ? t("copiedToClipboard") : t("shareCertificate")}
          </button>
        </div>
      </div>
    </div>
  );
}
