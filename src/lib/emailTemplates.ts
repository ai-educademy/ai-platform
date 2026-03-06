export function welcomeEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI Educademy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333;">
  <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎓 AI Educademy</h1>
              <p style="margin: 8px 0 0 0; color: #e9d8ff; font-size: 14px;">Welcome to our community!</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px;">Welcome, ${email}! 👋</h2>
              
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for joining the AI Educademy community! We're excited to have you on board. Whether you're looking to learn, experiment, or collaborate, you're in the right place.
              </p>

              <p style="margin: 0 0 32px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Here's what you can explore:
              </p>

              <!-- CTA Buttons -->
              <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 0 8px 16px 0; width: 33.33%;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #667eea; border-radius: 6px;">
                      <tr>
                        <td style="padding: 12px; text-align: center;">
                          <a href="https://aieducademy.vercel.app/programs" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">Browse Programs</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding: 0 8px 16px 0; width: 33.33%;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #764ba2; border-radius: 6px;">
                      <tr>
                        <td style="padding: 12px; text-align: center;">
                          <a href="https://aieducademy.vercel.app/lab" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">Try AI Lab</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="padding: 0; width: 33.34%;">
                    <table cellpadding="0" cellspacing="0" style="width: 100%; background-color: #5a67d8; border-radius: 6px;">
                      <tr>
                        <td style="padding: 12px; text-align: center;">
                          <a href="https://github.com/ai-educademy" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px;">Join GitHub</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Happy learning! If you have any questions, feel free to reach out to us anytime.
              </p>

              <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Best regards,<br>
                <strong>The AI Educademy Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
                You received this email because you subscribed to AI Educademy.<br>
                <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a> · 
                <a href="#" style="color: #667eea; text-decoration: none;">Preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
