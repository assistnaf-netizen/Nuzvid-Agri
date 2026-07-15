import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (email !== 'assist.naf@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized email address' });
    }

    // You MUST provide SMTP_USER and SMTP_PASS in your Vercel/environment variables.
    // SMTP_USER would typically be 'assist.naf@gmail.com'
    // SMTP_PASS would be an App Password generated from your Google Account settings.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'assist.naf@gmail.com',
        pass: process.env.SMTP_PASS 
      }
    });

    const mailOptions = {
      from: `"Nuzvid Agri Farms" <${process.env.SMTP_USER || 'assist.naf@gmail.com'}>`,
      to: email,
      subject: 'Admin Login OTP - Nuzvid Agri Farms',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2b5c3a; text-align: center;">Nuzvid Agri Farms</h2>
          <h3 style="text-align: center;">Admin Panel Access</h3>
          <p>You requested to login to the admin panel. Please use the following One-Time Password (OTP) to complete your login:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; margin: 0; color: #333;">${otp}</h1>
          </div>
          <p>This OTP is valid for a single use. Do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">If you did not request this login, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ message: 'Failed to send OTP email', error: error.message });
  }
}
