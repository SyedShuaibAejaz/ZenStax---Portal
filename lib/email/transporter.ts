import "server-only";

import nodemailer from "nodemailer";

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

export const emailTransporter =
  nodemailer.createTransport({
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