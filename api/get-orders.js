export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { return res.status(405).json({ error: 'Method Not Allowed' }); }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { user_id, email, all } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    // Admin: fetch all orders
    if (all === 'true') {
      // no filter
    } else if (user_id) {
      // Try by user_id first, then fallback to email
      query = query.eq('user_id', user_id);
    } else if (email) {
      query = query.eq('customer_email', email);
    } else {
      return res.status(400).json({ error: 'Must provide user_id, email, or all=true' });
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ orders: data || [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
