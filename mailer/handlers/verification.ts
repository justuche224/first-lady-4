import { sendMail } from "../index";
import { getEmailTemplate } from "./template";

export const sendVerificationEmail = async (
  email: string,
  verificationUrl: string
): Promise<void> => {
  const subject = "Verify Your Email - Skal";
  const text = `Welcome to Skal! Please verify your email address by clicking the following link: ${verificationUrl}`;
  const html = getEmailTemplate(
    "Verify Your Email Address",
    `
      <p>Welcome to Skal!</p>
      <p>Thank you for signing up. To complete your registration and start renting trading bots, please verify your email address by clicking the button below.</p>
      <p style="margin-top: 20px;">If you didn&apos;t create an account, you can safely ignore this email.</p>
    `,
    "Verify Email",
    verificationUrl
  );

  await sendMail({ to: email, subject, text, html });
};
