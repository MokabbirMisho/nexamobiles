import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export const sendOrderConfirmation = async (user, order) => {
  if (!resend) {
    console.log(`[email] (Resend not configured) Order #${order.id} confirmation for ${user.email}`);
    return;
  }
  const itemsHtml = (order.items || [])
    .map((i) => `<li>Qty ${i.quantity} × €${Number(i.unitPrice).toFixed(2)}</li>`)
    .join('');

  await resend.emails.send({
    from: process.env.EMAIL_FROM || '[email protected]',
    to: user.email,
    subject: `NexaMobiles — Order #${order.id} confirmed`,
    html: `
      <h2>Thanks for your order, ${user.name}!</h2>
      <p>Your order <strong>#${order.id}</strong> has been confirmed.</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total: €${Number(order.totalAmount).toFixed(2)}</strong></p>
      <p>We'll notify you when it ships.</p>
    `,
  });
};
