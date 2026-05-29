import PDFDocument from 'pdfkit';

// Builds an order-confirmation receipt PDF and resolves to a Buffer.
export const generateReceiptPdf = (user, order) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const accent = '#111827';
      const muted = '#6b7280';
      const euro = (n) => `EUR ${Number(n).toFixed(2)}`;

      // Header
      doc.fillColor(accent).fontSize(24).text('NexaMobiles', { continued: false });
      doc.fillColor(muted).fontSize(10).text('Premium phones & accessories', { lineGap: 2 });
      doc.moveDown(1);

      doc.fillColor(accent).fontSize(16).text('Order Confirmation');
      doc.moveDown(0.5);

      // Meta
      const placed = new Date(order.createdAt || Date.now()).toLocaleString('en-GB');
      doc.fillColor(muted).fontSize(10);
      doc.text(`Order #: ${order.id}`);
      doc.text(`Date: ${placed}`);
      doc.text(`Customer: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Payment: ${order.paymentStatus || 'PAID'}`);
      doc.moveDown(1);

      // Table header
      const startX = 50;
      let y = doc.y;
      doc.fillColor(accent).fontSize(11);
      doc.text('Item', startX, y);
      doc.text('Qty', 330, y, { width: 50, align: 'right' });
      doc.text('Unit', 390, y, { width: 70, align: 'right' });
      doc.text('Total', 460, y, { width: 90, align: 'right' });
      y += 16;
      doc.moveTo(startX, y).lineTo(550, y).strokeColor('#e5e7eb').stroke();
      y += 8;

      // Rows
      doc.fontSize(10).fillColor('#111827');
      for (const it of order.items || []) {
        const name = it.product?.name || `Product #${it.productId || ''}`;
        const variant = it.variant
          ? [it.variant.storage, it.variant.color].filter(Boolean).join(' / ')
          : '';
        const label = variant ? `${name} (${variant})` : name;
        const lineTotal = Number(it.unitPrice) * it.quantity;

        doc.fillColor('#111827').text(label, startX, y, { width: 270 });
        doc.text(String(it.quantity), 330, y, { width: 50, align: 'right' });
        doc.text(euro(it.unitPrice), 390, y, { width: 70, align: 'right' });
        doc.text(euro(lineTotal), 460, y, { width: 90, align: 'right' });
        y = doc.y + 6;
      }

      doc.moveTo(startX, y).lineTo(550, y).strokeColor('#e5e7eb').stroke();
      y += 12;

      // Total
      doc.fillColor(accent).fontSize(13).text('Total', 330, y, { width: 120, align: 'right' });
      doc.text(euro(order.totalAmount), 460, y, { width: 90, align: 'right' });

      doc.moveDown(3);
      doc.fillColor(muted).fontSize(9).text(
        'Thank you for shopping with NexaMobiles. This document is your proof of order. ' +
        'For questions, reply to your confirmation email.',
        startX,
        doc.y,
        { width: 500 },
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
