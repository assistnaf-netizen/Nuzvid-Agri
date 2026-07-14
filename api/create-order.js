export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    // ---- If this is a "save order" call (after payment success) ----
    if (body.action === 'save_order') {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { orderPayload, itemsPayload } = body;

      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert([orderPayload])
        .select();

      if (orderError) {
        console.error('Order insert error:', orderError);
        return res.status(500).json({ error: orderError.message });
      }

      const realOrderId = orderData[0].id;
      const itemsToInsert = itemsPayload.map(item => ({ ...item, order_id: realOrderId }));

      const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
      if (itemsError) {
        console.error('Items insert error:', itemsError);
        return res.status(500).json({ error: itemsError.message });
      }

      return res.status(200).json({ success: true, orderId: realOrderId });
    }

    // ---- Default: create Razorpay order ----
    const { amount, receipt } = body;
    const key_id = process.env.VITE_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({ error: 'Razorpay keys not configured' });
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64')
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.description || 'Failed to create order');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in create-order handler:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

