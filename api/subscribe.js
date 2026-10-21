import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fknkpjxamdwaytzayiwn.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SMTP_USER = process.env.SMTP_USER || 'assist.naf@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = 'assist.naf@gmail.com';

// Email transporter (fallback when Supabase fails)
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

// Try to save email to Supabase
async function saveToSupabase(email) {
  if (!SERVICE_ROLE_KEY) return { success: false, error: 'No service key' };

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .insert([{ email: email.toLowerCase().trim(), source: 'footer' }])
    .select('id');

  return { success: !error, error: error?.message, code: error?.code };
}

// Fallback: notify admin via email that someone subscribed
async function notifyAdminByEmail(email) {
  if (!SMTP_PASS) return false;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Nuzvid Agri Farms" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: '🌿 New Newsletter Subscriber',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #fdf8f3; border-radius: 12px; border: 1px solid #e8d5b7;">
          <h2 style="color: #7b4f2e; margin-top: 0;">New Newsletter Subscriber</h2>
          <p style="font-size: 16px; color: #3d2b1f;">
            <strong>Email:</strong> <a href="mailto:${email}" style="color: #D68D3C;">${email}</a>
          </p>
          <p style="font-size: 13px; color: #888; margin-top: 16px;">
            Subscribed at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST<br/>
            Source: Website Footer Newsletter
          </p>
          <hr style="border: none; border-top: 1px solid #e8d5b7; margin: 20px 0;"/>
          <p style="font-size: 11px; color: #aaa; text-align: center;">
            Nuzvid Agri Farms — Auto notification
          </p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email notify error:', err.message);
    return false;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // Attempt 1: Save to Supabase DB
    const supaResult = await saveToSupabase(cleanEmail);

    if (supaResult.success) {
      // Saved to DB — also send confirmation email to admin (non-blocking)
      notifyAdminByEmail(cleanEmail).catch(() => {});
      return res.status(200).json({
        success: true,
        message: 'Subscribed successfully! Welcome to the Nuzvid Agri Farms family 🌿',
      });
    }

    // Duplicate email in DB
    if (supaResult.code === '23505') {
      return res.status(200).json({
        success: true,
        already: true,
        message: "You're already subscribed! 🎉",
      });
    }

    // Supabase failed (table missing, network, etc.) — fallback to email notification
    console.log('Supabase failed:', supaResult.error, '— using email fallback');
    const emailSent = await notifyAdminByEmail(cleanEmail);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: 'Subscribed successfully! Welcome to the Nuzvid Agri Farms family 🌿',
      });
    }

    // Both failed
    return res.status(500).json({ error: 'Could not subscribe. Please try again later.' });

  } catch (err) {
    console.error('Subscribe exception:', err);

    // Last resort — try email fallback
    const emailSent = await notifyAdminByEmail(cleanEmail).catch(() => false);
    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: 'Subscribed successfully! Welcome to the Nuzvid Agri Farms family 🌿',
      });
    }

    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
