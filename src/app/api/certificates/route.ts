import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lessonProgress, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getProgram } from "@/lib/programs";
import { getLessons } from "@/lib/lessons";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { searchParams } = new URL(req.url);
  const programSlug = searchParams.get("programSlug");

  if (!programSlug) {
    return new Response(
      JSON.stringify({ error: "programSlug is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const program = getProgram(programSlug);
  if (!program) {
    return new Response(JSON.stringify({ error: "Program not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get all published lessons for this program
  const lessons = getLessons(programSlug, "en");
  if (lessons.length === 0) {
    return new Response(
      JSON.stringify({ error: "No lessons available for this program" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check user's completed lessons for this program
  const completed = await db
    .select({ lessonSlug: lessonProgress.lessonSlug })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, session.user.id),
        eq(lessonProgress.programSlug, programSlug)
      )
    );

  const completedSlugs = new Set(completed.map((c) => c.lessonSlug));
  const allCompleted = lessons.every((l) => completedSlugs.has(l.slug));

  if (!allCompleted) {
    return new Response(
      JSON.stringify({
        error: "Complete all lessons to earn your certificate",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // Premium gate: only premium users can download certificates
  {
    const userRecord = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((rows) => rows[0]);
    const role = userRecord?.role ?? "free";
    if (role !== "pro" && role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Upgrade to Pro to download certificates" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Generate certificate PDF
  const pdfBytes = await generateCertificatePdf({
    userName: session.user.name || session.user.email || "Learner",
    programTitle: programSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    trackName: program.track
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    programIcon: program.icon,
    userId: session.user.id,
    programSlug,
  });

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificate-${programSlug}.pdf"`,
    },
  });
}

interface CertificateData {
  userName: string;
  programTitle: string;
  trackName: string;
  programIcon: string;
  userId: string;
  programSlug: string;
}

async function generateCertificatePdf(
  data: CertificateData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 Landscape: 842 x 595 points
  const pageWidth = 842;
  const pageHeight = 595;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanItalic = await pdfDoc.embedFont(
    StandardFonts.TimesRomanItalic
  );
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const gold = rgb(0.76, 0.6, 0.2); // #C29933 — elegant gold
  const darkText = rgb(0.15, 0.15, 0.2);
  const mutedText = rgb(0.4, 0.4, 0.45);
  const accentBlue = rgb(0.2, 0.35, 0.55);

  // --- Outer border ---
  const borderMargin = 24;
  page.drawRectangle({
    x: borderMargin,
    y: borderMargin,
    width: pageWidth - borderMargin * 2,
    height: pageHeight - borderMargin * 2,
    borderColor: gold,
    borderWidth: 3,
  });

  // --- Inner border ---
  const innerMargin = 34;
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: pageWidth - innerMargin * 2,
    height: pageHeight - innerMargin * 2,
    borderColor: gold,
    borderWidth: 1,
  });

  // --- Corner accents (small decorative squares) ---
  const cornerSize = 8;
  const corners = [
    { x: borderMargin + 4, y: pageHeight - borderMargin - cornerSize - 4 },
    {
      x: pageWidth - borderMargin - cornerSize - 4,
      y: pageHeight - borderMargin - cornerSize - 4,
    },
    { x: borderMargin + 4, y: borderMargin + 4 },
    { x: pageWidth - borderMargin - cornerSize - 4, y: borderMargin + 4 },
  ];
  for (const corner of corners) {
    page.drawRectangle({
      x: corner.x,
      y: corner.y,
      width: cornerSize,
      height: cornerSize,
      color: gold,
    });
  }

  // --- Decorative line under title area ---
  const lineY = pageHeight - 170;
  page.drawLine({
    start: { x: 200, y: lineY },
    end: { x: pageWidth - 200, y: lineY },
    thickness: 1.5,
    color: gold,
  });

  // --- Logo ---
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoH = 50;
    const logoW = (logoImage.width / logoImage.height) * logoH;
    page.drawImage(logoImage, {
      x: (pageWidth - logoW) / 2,
      y: pageHeight - 100,
      width: logoW,
      height: logoH,
    });
  } catch {
    // Logo not found — continue without it
  }

  // --- Title: "Certificate of Completion" ---
  const title = "Certificate of Completion";
  const titleFontSize = 36;
  const titleWidth = timesRomanBold.widthOfTextAtSize(title, titleFontSize);
  page.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 150,
    size: titleFontSize,
    font: timesRomanBold,
    color: darkText,
  });

  // --- Subtitle: "This certifies that" ---
  const subtitle = "This certifies that";
  const subtitleFontSize = 14;
  const subtitleWidth = timesRomanItalic.widthOfTextAtSize(
    subtitle,
    subtitleFontSize
  );
  page.drawText(subtitle, {
    x: (pageWidth - subtitleWidth) / 2,
    y: pageHeight - 210,
    size: subtitleFontSize,
    font: timesRomanItalic,
    color: mutedText,
  });

  // --- User name ---
  const nameFontSize = 28;
  const nameWidth = timesRomanBold.widthOfTextAtSize(
    data.userName,
    nameFontSize
  );
  page.drawText(data.userName, {
    x: (pageWidth - nameWidth) / 2,
    y: pageHeight - 255,
    size: nameFontSize,
    font: timesRomanBold,
    color: accentBlue,
  });

  // --- Decorative line under name ---
  const nameLineY = pageHeight - 270;
  const nameLineHalf = Math.min(nameWidth * 0.7, 180);
  page.drawLine({
    start: { x: pageWidth / 2 - nameLineHalf, y: nameLineY },
    end: { x: pageWidth / 2 + nameLineHalf, y: nameLineY },
    thickness: 0.75,
    color: gold,
  });

  // --- "has successfully completed" ---
  const completedText = "has successfully completed";
  const completedFontSize = 14;
  const completedWidth = timesRomanItalic.widthOfTextAtSize(
    completedText,
    completedFontSize
  );
  page.drawText(completedText, {
    x: (pageWidth - completedWidth) / 2,
    y: pageHeight - 305,
    size: completedFontSize,
    font: timesRomanItalic,
    color: mutedText,
  });

  // --- Program title ---
  const programFontSize = 22;
  const programWidth = timesRomanBold.widthOfTextAtSize(
    data.programTitle,
    programFontSize
  );
  page.drawText(data.programTitle, {
    x: (pageWidth - programWidth) / 2,
    y: pageHeight - 345,
    size: programFontSize,
    font: timesRomanBold,
    color: darkText,
  });

  // --- Track name ---
  const trackLabel = `Track: ${data.trackName}`;
  const trackFontSize = 12;
  const trackWidth = helvetica.widthOfTextAtSize(trackLabel, trackFontSize);
  page.drawText(trackLabel, {
    x: (pageWidth - trackWidth) / 2,
    y: pageHeight - 370,
    size: trackFontSize,
    font: helvetica,
    color: mutedText,
  });

  // --- Date of completion ---
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateFontSize = 12;
  const dateLabel = `Completed on ${dateStr}`;
  const dateWidth = helvetica.widthOfTextAtSize(dateLabel, dateFontSize);
  page.drawText(dateLabel, {
    x: (pageWidth - dateWidth) / 2,
    y: pageHeight - 415,
    size: dateFontSize,
    font: helvetica,
    color: mutedText,
  });

  // --- Decorative line above footer ---
  const footerLineY = 105;
  page.drawLine({
    start: { x: 200, y: footerLineY },
    end: { x: pageWidth - 200, y: footerLineY },
    thickness: 1,
    color: gold,
  });

  // --- Footer: "AI Educademy" ---
  const orgName = "AI Educademy";
  const orgFontSize = 16;
  const orgWidth = timesRomanBold.widthOfTextAtSize(orgName, orgFontSize);
  page.drawText(orgName, {
    x: (pageWidth - orgWidth) / 2,
    y: 78,
    size: orgFontSize,
    font: timesRomanBold,
    color: darkText,
  });

  // --- Footer URL ---
  const url = "aieducademy.org";
  const urlFontSize = 10;
  const urlWidth = helvetica.widthOfTextAtSize(url, urlFontSize);
  page.drawText(url, {
    x: (pageWidth - urlWidth) / 2,
    y: 62,
    size: urlFontSize,
    font: helvetica,
    color: mutedText,
  });

  // --- Certificate ID ---
  const today = new Date().toISOString().split("T")[0];
  const certId = crypto
    .createHash("sha256")
    .update(`${data.userId}:${data.programSlug}:${today}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  const certLabel = `Certificate ID: ${certId}`;
  const certFontSize = 8;
  const certWidth = helvetica.widthOfTextAtSize(certLabel, certFontSize);
  page.drawText(certLabel, {
    x: (pageWidth - certWidth) / 2,
    y: 46,
    size: certFontSize,
    font: helvetica,
    color: mutedText,
  });

  return pdfDoc.save();
}
