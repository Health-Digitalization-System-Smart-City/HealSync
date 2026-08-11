// Email delivery for auth flows (password reset — ROADMAP 1.7).
//
// Uses Resend when RESEND_API_KEY is configured; otherwise the reset link is
// logged to the server console so the flow remains usable in development
// without an email provider.
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM ?? "HealSync <no-reply@healsync.com>";

export interface SendPasswordResetEmailInput {
  email: string;
  name: string;
  /** Full reset URL (Better Auth: `${baseURL}/reset-password/${token}`). */
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: SendPasswordResetEmailInput): Promise<void> {
  if (!resend) {
    // Development fallback — never send real email without a provider.
    console.info(
      `[auth] Password reset requested for ${email}. Reset link (dev preview): ${resetUrl}`,
    );
    return;
  }

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Reset your HealSync password",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-top: 0;">Reset your HealSync password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset the password for your HealSync dashboard account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #059669; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none;">
            Reset password
          </a>
        </p>
        <p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
