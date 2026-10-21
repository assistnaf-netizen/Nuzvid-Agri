import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fknkpjxamdwaytzayiwn.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role client — bypasses RLS, can do anything
const getAdminClient = () =>
  createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

// Create the table via Supabase's SQL over HTTP (service role required)
async function createTableViaSql() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      email text NOT NULL,
      subscribed_at timestamptz DEFAULT now(),
      source text DEFAULT 'footer',
      CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
    );
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='newsletter_subscribers' AND policyname='Allow public inserts'
      ) THEN
        EXECUTE 'CREATE POLICY "Allow public inserts" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true)';
      END IF;
    END $$;
  `;

  // Supabase exposes SQL execution via the pg-meta REST API on Vercel
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    // Fallback: use the pg meta API (available on Supabase projects)
    const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    return pgRes.ok;
  }
  return true;
}

// Try to insert a subscriber
async function insertEmail(email) {
  const supabase = getAdminClient();
  return await supabase
    .from('newsletter_subscribers')
    .insert([{ email: email.toLowerCase().trim(), source: 'footer' }])
    .select('id');
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Validate
  const { email } = req.body || {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY not set');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    // First attempt
    let { data, error } = await insertEmail(email);

    if (error) {
      // Table doesn't exist — auto-create and retry
      if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
        console.log('Table not found. Auto-creating newsletter_subscribers...');
        await createTableViaSql();
        // Wait briefly for table creation to propagate
        await new Promise(r => setTimeout(r, 500));
        const retry = await insertEmail(email);
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        // Already subscribed
        if (error.code === '23505') {
          return res.status(200).json({
            success: true,
            already: true,
            message: "You're already subscribed! 🎉",
          });
        }
        console.error('Subscribe insert error:', error);
        return res.status(500).json({ error: 'Could not subscribe. Please try again.' });
      }
    }

    console.log(`✅ New subscriber: ${email}`);
    return res.status(200).json({
      success: true,
      message: 'Subscribed successfully! Welcome to the Nuzvid Agri Farms family 🌿',
    });

  } catch (err) {
    console.error('Subscribe handler exception:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
