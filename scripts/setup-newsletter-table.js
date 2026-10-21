/**
 * setup-newsletter-table.js
 * Run this script once to auto-create the newsletter_subscribers table in Supabase.
 * Usage: node scripts/setup-newsletter-table.js
 * 
 * This uses the Supabase service role key — no manual login needed.
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fknkpjxamdwaytzayiwn.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function setupNewsletterTable() {
  console.log('🔧 Setting up newsletter_subscribers table...');

  // Try inserting into a dummy record to check if table exists
  const { error: checkError } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('✅ Table "newsletter_subscribers" already exists — nothing to do.');
    return;
  }

  if (checkError.code !== '42P01') {
    console.error('❌ Unexpected error:', checkError.message);
    return;
  }

  // Table doesn't exist — create it via Supabase SQL REST API
  console.log('📋 Table not found. Creating via Supabase SQL API...');

  const createSQL = `
    CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      email text NOT NULL,
      subscribed_at timestamptz DEFAULT now(),
      source text DEFAULT 'footer',
      CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
    );

    -- Enable Row Level Security
    ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

    -- Allow anyone to insert (subscribe)
    CREATE POLICY IF NOT EXISTS "Allow public inserts"
      ON public.newsletter_subscribers
      FOR INSERT
      WITH CHECK (true);

    -- Only service role can read all subscribers
    CREATE POLICY IF NOT EXISTS "Service role reads all"
      ON public.newsletter_subscribers
      FOR SELECT
      USING (auth.role() = 'service_role');
  `;

  // Use Supabase's /rest/v1/rpc if a raw SQL function exists
  // Otherwise fall back to the pg REST meta API
  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql: createSQL }),
  });

  if (sqlRes.ok) {
    console.log('✅ Table created successfully via exec_sql RPC!');
    return;
  }

  // Fallback: try Management API
  const mgmtRes = await fetch(
    `https://api.supabase.com/v1/projects/fknkpjxamdwaytzayiwn/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: createSQL }),
    }
  );

  if (mgmtRes.ok) {
    console.log('✅ Table created successfully via Management API!');
    return;
  }

  console.log('\n⚠️  Auto-create via API not available.');
  console.log('👉 Please run this SQL manually in Supabase SQL Editor:\n');
  console.log('-----------------------------------------------------------');
  console.log(`
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  source text DEFAULT 'footer',
  CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts"
  ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
  `);
  console.log('-----------------------------------------------------------');
}

setupNewsletterTable().catch(console.error);
