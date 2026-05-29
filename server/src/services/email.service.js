import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { generateReceiptPdf } from './receipt.service.js';

// --- Sender selection ---------------------------------------------------
// Provider priority (first one configured wins):
//   1. Brevo  — HTTP API (port 443), works on Render's free tier where SMTP is
//      blocked. Free 300/day; can send to ANY recipient once a single sender
//      email is verified (no domain needed). Set BREVO_API_KEY (+ EMAIL_FROM).
//   2. Gmail SMTP — works locally; blocked on Render free tier.
//   3. Resend — HTTP API, but free tier only sends to your own account email.
const brevoKey = process.env.BREVO_API_KEY;
const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;
const useBrevo = !!brevoKey;
const useGmail = !useBrevo && !!(gmailUser && gmailPass);

const transporter = useGmail
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })
  : null;

const apiKey = process.env.RESEND_API_KEY;
const resend = !useBrevo && !useGmail && apiKey ? new Resend(apiKey) : null;

const FROM =
  process.env.EMAIL_FROM ||
  `NexaMobiles <${gmailUser || 'mokabbirmiso1992@gmail.com'}>`;

// Parse "Name <email@x.com>" or "email@x.com" into { name, email }.
const parseFrom = (s) => {
  const m = s.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (m) return { name: m[1] || 'NexaMobiles', email: m[2] };
  return { name: 'NexaMobiles', email: s.trim() };
};

// Core send helper: routes through Brevo / Gmail / Resend, logs the outcome.
const send = async ({ to, subject, html, pdf, pdfName }) => {
  if (useBrevo) {
    const sender = parseFrom(FROM);
    const body = {
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };
    if (pdf) body.attachment = [{ name: pdfName, content: pdf.toString('base64') }];

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`[email] Brevo rejected (${res.status}):`, txt);
    } else {
      const data = await res.json().catch(() => ({}));
      console.log(`[email] sent to ${to} via Brevo (id=${data.messageId || 'ok'})`);
    }
    return;
  }
  if (useGmail) {
    const attachments = pdf ? [{ filename: pdfName, content: pdf }] : undefined;
    const info = await transporter.sendMail({ from: FROM, to, subject, html, attachments });
    console.log(`[email] sent to ${to} via Gmail (id=${info.messageId})`);
    return;
  }
  if (resend) {
    const attachments = pdf ? [{ filename: pdfName, content: pdf.toString('base64') }] : undefined;
    const r = await resend.emails.send({ from: FROM, to, subject, html, attachments });
    if (r?.error) console.error('[email] rejected by Resend:', JSON.stringify(r.error));
    else console.log(`[email] sent to ${to} via Resend (id=${r?.data?.id})`);
    return;
  }
  console.log(`[email] (no email provider configured) would send "${subject}" to ${to}`);
};

// Sent right after a customer creates an account.
export const sendWelcomeEmail = async (user) => {
  try {
    await send({
      to: user.email,
      subject: 'Welcome to NexaMobiles!',
      html: `
        <h2>Welcome, ${user.name}!</h2>
        <p>Your NexaMobiles account has been created successfully.</p>
        <p>You can now browse premium phones &amp; accessories, save items to your cart, and check out securely.</p>
        <p>Happy shopping!<br/>— The NexaMobiles Team</p>
      `,
    });
  } catch (e) {
    console.error('[email] welcome failed:', e.message);
  }
};

// Sent after an order is paid/confirmed — includes a PDF receipt attachment.
export const sendOrderConfirmation = async (user, order) => {
  const itemsHtml = (order.items || [])
    .map((i) => {
      const name = i.product?.name || `Product #${i.productId || ''}`;
      return `<li>${i.quantity} × ${name} — €${Number(i.unitPrice).toFixed(2)}</li>`;
    })
    .join('');

  let pdf;
  try {
    pdf = await generateReceiptPdf(user, order);
  } catch (e) {
    console.error('[email] receipt PDF failed:', e.message);
  }

  try {
    await send({
      to: user.email,
      subject: `NexaMobiles — Order #${order.id} confirmed`,
      html: `
        <h2>Thanks for your order, ${user.name}!</h2>
        <p>Your order <strong>#${order.id}</strong> has been confirmed and paid.</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total: €${Number(order.totalAmount).toFixed(2)}</strong></p>
        <p>Your receipt is attached as a PDF. We'll notify you when it ships.</p>
      `,
      pdf,
      pdfName: `NexaMobiles-Order-${order.id}.pdf`,
    });
  } catch (e) {
    console.error('[email] order confirmation failed:', e.message);
  }
};
