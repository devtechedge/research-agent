import nodemailer from 'nodemailer';
import { addLog } from './db';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Dispatches a real email if SMTP credentials are provided,
 * otherwise falls back to helpful log instructions.
 */
export async function sendDigestEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; dispatched: boolean; info?: any }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_APP_PASSWORD_USER || '';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  const secure = process.env.SMTP_SECURE !== 'false' && (port === 465 || !process.env.SMTP_SECURE);

  if (!user || !pass) {
    addLog(`[Email Dispatcher] ⚠️ Real email dispatch is inactive because SMTP_USER / SMTP_PASS secrets are not configured.`);
    addLog(`[Email Dispatcher] 💡 To receive real emails, set the following environment variables or GitHub secrets:`);
    addLog(`[Email Dispatcher]    - SMTP_USER: Your email address (e.g., devayanmandal@gmail.com)`);
    addLog(`[Email Dispatcher]    - SMTP_PASS: Your App Password (for Gmail: Google Account -> Security -> App Passwords)`);
    addLog(`[Email Dispatcher]    - SMTP_HOST: smtp.gmail.com (defaults to Gmail)`);
    addLog(`[Email Dispatcher]    - SMTP_PORT: 465 (defaults to SSL port 465)`);
    return { success: true, dispatched: false };
  }

  try {
    addLog(`[Email Dispatcher] Connecting to SMTP server ${host}:${port}...`);
    
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    addLog(`[Email Dispatcher] Dispatched email payload to recipient: ${to}`);

    const info = await transporter.sendMail({
      from: `"LymeWatch Clinical Agent" <${user}>`,
      to,
      subject,
      html,
    });

    addLog(`[Email Dispatcher] ✅ SUCCESS! Email dispatched successfully via SMTP. Message ID: ${info.messageId}`);
    return { success: true, dispatched: true, info };
  } catch (err: any) {
    addLog(`[Email Dispatcher] ❌ SMTP Connection or Send Failed: ${err.message || err}`);
    throw err;
  }
}
