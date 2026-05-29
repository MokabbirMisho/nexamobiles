import { generateReceiptPdf } from './receipt.service.js';

// --- Email provider: Brevo (HTTP API) -----------------------------------
// Brevo's HTTP API uses port 443, so it works on Render's free tier (where
// outbound SMTP is blocked). Free 300/day; can send to ANY recipient once a
// single sender email is verified (no domain needed).
//   Set BREVO_API_KEY (+ optional EMAIL_FROM, defaults below).
const brevoKey = process.env.BREVO_API_KEY;
const FROM = process.env.EMAIL_FROM || 'NexaMobiles <mokabbirmiso1992@gmail.com>';

// Parse "Name <email@x.com>" or "email@x.com" into { name, email }.
const parseFrom = (s) => {
  const m = s.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (m) return { name: m[1] || 'NexaMobiles', email: m[2] };
  return { name: 'NexaMobiles', email: s.trim() };
};

// Core send helper: posts to Brevo and logs the outcome.
const send = async ({ to, subject, html, pdf, pdfName }) => {
  if (!brevoKey) {
    console.log(`[email] (Brevo not configured) would send "${subject}" to ${to}`);
    return;
  }

  const body = {
    sender: parseFrom(FROM),
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
