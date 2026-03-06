import { welcomeEmailHtml } from "./emailTemplates";

export async function sendWelcomeEmail(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[Email] No RESEND_API_KEY set. Skipping email for ${email}`);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const htmlContent = welcomeEmailHtml(email);

    await resend.emails.send({
      from: "Open AI School <noreply@openaisc.dev>",
      to: email,
      subject: "Welcome to Open AI School! 🎓",
      html: htmlContent,
    });

    console.log(`[Email] Welcome email sent successfully to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send welcome email to ${email}:`, error);
    // Graceful degradation - don't throw, just log
  }
}
