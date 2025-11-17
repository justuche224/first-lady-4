import { sendMail } from "../index";
import { getEmailTemplate } from "./template";

export const sendForgotPasswordEmail = async (
  email: string,
  resetUrl: string
): Promise<void> => {
  const subject = "Reset Your Password - Skal";
  const text = `You requested to reset your password for your Skal account. Click the following link to reset your password: ${resetUrl}`;
  const html = getEmailTemplate(
    "Reset Your Password",
    `
      <p>You requested to reset your password for your Skal account.</p>
      <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
      <p style="margin-top: 20px;">If you didn&apos;t request a password reset, please ignore this email or contact our support team.</p>
    `,
    "Reset Password",
    resetUrl
  );

  await sendMail({ to: email, subject, text, html });
};
