export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }

  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: 'Missing orderId or status' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
       return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({ success: true, order: data[0] });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
