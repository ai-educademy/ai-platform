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

    // Note: onboarding@resend.dev can only deliver to the Resend account owner's
    // email on the free plan. To send to any subscriber, add and verify a custom
    // domain in the Resend dashboard (e.g. noreply@aieducademy.com).
    const fromAddress = process.env.RESEND_FROM_EMAIL || "AI Educademy <onboarding@resend.dev>";

    const result = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "Welcome to AI Educademy! 🎓",
      html: htmlContent,
    });

    if (result.error) {
      console.error(`[Email] Resend API error for ${email}:`, result.error);
    } else {
      console.log(`[Email] Welcome email sent successfully to ${email} (id: ${result.data?.id})`);
    }
  } catch (error) {
    console.error(`[Email] Failed to send welcome email to ${email}:`, error);
  }
}
