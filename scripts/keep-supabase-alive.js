import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase Keep-Alive] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function pingDatabase() {
  const timestamp = new Date().toISOString();
  console.log(`[Supabase Keep-Alive] [${timestamp}] Pinging database at ${supabaseUrl}...`);

  try {
    const start = Date.now();
    const { data, error } = await supabase.from('products').select('id').limit(1);

    if (error) {
      console.warn(`[Supabase Keep-Alive] Query completed with warning:`, error.message);
    } else {
      console.log(`[Supabase Keep-Alive] SUCCESS: Database is active! Latency: ${Date.now() - start}ms`);
    }
  } catch (err) {
    console.error(`[Supabase Keep-Alive] Ping failed:`, err.message);
  }
}

pingDatabase();
