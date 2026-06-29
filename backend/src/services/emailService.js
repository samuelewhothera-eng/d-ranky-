const nodemailer = require("nodemailer");

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendOrderConfirmation({ toEmail, toName, trackingId, items, amount, shippingAddress }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Email not configured — skipping order confirmation email.");
    return;
  }

  const itemRows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2318;color:#fafaf7;">${i.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2318;color:#fafaf7;text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2318;color:#C9A84C;text-align:right;">₦${(i.unitPrice * i.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;">
    <tr>
      <td style="background:#0D0D0D;padding:40px 40px 20px;text-align:center;border-bottom:1px solid #C9A84C;">
        <h1 style="font-family:Georgia,serif;font-size:2rem;font-weight:300;letter-spacing:.3em;color:#C9A84C;margin:0;">D RANKY</h1>
        <p style="font-size:.65rem;letter-spacing:.3em;text-transform:uppercase;color:#666;margin:6px 0 0;">Order Confirmation</p>
      </td>
    </tr>
    <tr>
      <td style="background:#111;padding:36px 40px;">
        <p style="color:#fafaf7;font-size:.95rem;margin:0 0 8px;">Hi ${toName},</p>
        <p style="color:#999;font-size:.85rem;line-height:1.8;margin:0 0 28px;">Thank you for your order. We've received your payment and are preparing your pieces. You'll hear from us once your order ships.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="background:#1A1A1A;padding:14px 16px;border-radius:4px;">
              <p style="margin:0;font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:#666;">Tracking ID</p>
              <p style="margin:6px 0 0;font-family:Georgia,serif;font-size:1.3rem;color:#C9A84C;letter-spacing:.15em;">${trackingId}</p>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2318;margin-bottom:24px;">
          <tr style="background:#1A1510;">
            <th style="padding:8px 12px;text-align:left;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#666;font-weight:400;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#666;font-weight:400;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#666;font-weight:400;">Price</th>
          </tr>
          ${itemRows}
          <tr style="background:#1A1510;">
            <td colspan="2" style="padding:10px 12px;font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#999;">Total</td>
            <td style="padding:10px 12px;text-align:right;font-family:Georgia,serif;font-size:1.1rem;color:#C9A84C;">₦${amount.toLocaleString()}</td>
          </tr>
        </table>

        <p style="margin:0 0 4px;font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:#666;">Delivery Address</p>
        <p style="margin:0 0 28px;font-size:.85rem;color:#999;line-height:1.7;">${shippingAddress}</p>

        <p style="margin:0;font-size:.82rem;color:#999;line-height:1.8;">Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/2348168147520" style="color:#C9A84C;text-decoration:none;">08168147520</a>.</p>
      </td>
    </tr>
    <tr>
      <td style="background:#080806;padding:20px 40px;text-align:center;border-top:1px solid #1a1a1a;">
        <p style="margin:0;font-size:.65rem;letter-spacing:.15em;color:#444;">© 2026 D RANKY · Abuja, Nigeria</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getTransporter().sendMail({
    from: `"D RANKY" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Your D RANKY Order — ${trackingId}`,
    html,
  });
}

module.exports = { sendOrderConfirmation };
