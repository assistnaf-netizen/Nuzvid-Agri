import nodemailer from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER || 'assist.naf@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS?.replace(/"/g, '');
const ADMIN_EMAIL = 'assist.naf@gmail.com';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const formattedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 1. Send notification email to Admin (assist.naf@gmail.com)
    await transporter.sendMail({
      from: `"Nuzvid Agri Farms Contact" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `📬 New Contact Inquiry from ${name} - Nuzvid Agri Farms`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 3px solid #16a34a; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #166534; margin: 0; font-size: 22px;">New Contact Inquiry Received</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Received at: ${formattedDate} IST</p>
          </div>

          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #4b5563; width: 100px;"><strong>Name:</strong></td>
                <td style="padding: 6px 0; color: #111827;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4b5563;"><strong>Email:</strong></td>
                <td style="padding: 6px 0; color: #111827;"><a href="mailto:${email}" style="color: #16a34a; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4b5563;"><strong>Phone:</strong></td>
                <td style="padding: 6px 0; color: #111827;"><a href="tel:${phone || ''}" style="color: #111827; text-decoration: none;">${phone || 'Not provided'}</a></td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; font-size: 15px; margin: 0 0 8px 0;">Message:</h3>
            <div style="background: #fdfaf6; border-left: 4px solid #d68d3c; padding: 14px; border-radius: 4px; font-size: 14px; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${message}</div>
          </div>

          <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <a href="mailto:${email}" style="display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">Reply to ${name}</a>
          </div>
        </div>
      `,
    });

    // 2. Auto-reply confirmation to Customer
    transporter.sendMail({
      from: `"Nuzvid Agri Farms" <${SMTP_USER}>`,
      to: email,
      subject: `Thank you for contacting Nuzvid Agri Farms`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #166534; margin: 0 0 10px 0;">Hello ${name},</h2>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">Thank you for reaching out to <strong>Nuzvid Agri Farms</strong>. We have received your inquiry and our team will get in touch with you shortly.</p>
          <div style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #6b7280; font-size: 13px;"><strong>Your Message:</strong></p>
            <p style="margin: 5px 0 0 0; color: #111827; font-size: 14px; font-style: italic;">"${message}"</p>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">If your inquiry is urgent, you can also reach us directly via WhatsApp or Phone at <a href="tel:9030545655" style="color: #16a34a;">9030545655</a>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">Nuzvid Agri Farms • Pure &amp; Vedic Living • Nuzvid, Andhra Pradesh</p>
        </div>
      `,
    }).catch(() => {});

    return res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form email error:', error);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
}
