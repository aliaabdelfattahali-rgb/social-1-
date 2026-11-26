import nodemailer, { Transporter } from "nodemailer";
import { emailVerificationTemplate, passwordResetTemplate } from "./emailTemplate.js";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendEmail = async (options: MailOptions): Promise<void> => {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  otp: string,
  expiresIn: string
): Promise<void> => {
  const html = emailVerificationTemplate({ otp, name, expiresIn });
  await sendEmail({
    to: email,
    subject: "Verify Your Email Address - Social-App",
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  otp: string,
  expiresIn: string
): Promise<void> => {
  const html = passwordResetTemplate({ otp, name, expiresIn });
  await sendEmail({
    to: email,
    subject: "Reset Your Password - Social-App",
    html,
  });
};
