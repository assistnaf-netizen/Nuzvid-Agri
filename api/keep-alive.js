export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const start = Date.now();
    const { data, error } = await supabase.from('products').select('id').limit(1);

    if (error) {
      return res.status(200).json({
        status: 'warning',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      status: 'active',
      latency: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
