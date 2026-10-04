import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/**
 * Created on first use, so a missing SMTP variable only breaks email,
 * not the whole build or deployment.
 */
export function getEmailTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host) {
    throw new Error("SMTP_HOST is missing.");
  }

  if (!user) {
    throw new Error("SMTP_USER is missing.");
  }

  if (!password) {
    throw new Error("SMTP_PASSWORD is missing.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  return transporter;
}
