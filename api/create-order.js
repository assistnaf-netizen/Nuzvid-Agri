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

      // --- NEW NOTIFICATION LOGIC ---
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS?.replace(/"/g, '') // Google App Password
          }
        });

        const itemsList = itemsPayload.map(i => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${i.product_title}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${i.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${i.price_at_time}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${i.price_at_time * i.quantity}</td>
          </tr>
        `).join('');

        const mailOptions = {
          from: `"Nuzvid Agri Farms Orders" <${process.env.SMTP_USER}>`,
          to: ['assist.naf@gmail.com', orderPayload.customer_email].join(', '),
          subject: `Order Confirmation: #${orderPayload.display_id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Order Confirmation</h2>
              <p>Hi <strong>${orderPayload.customer_name}</strong>,</p>
              <p>Thank you for your order! We have received it and it is now being processed. Here are the details:</p>
              
              <h3 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">Customer Details</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${orderPayload.customer_name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${orderPayload.customer_email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderPayload.customer_phone}</p>
              <p style="margin: 5px 0;"><strong>Shipping Address:</strong> ${orderPayload.shipping_address}</p>

              <h3 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-top: 20px;">Order Summary</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderPayload.display_id}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> <span style="color: #ea580c; font-weight: bold;">₹${orderPayload.total_amount}</span></p>
              
              <h3 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-top: 20px;">Payment Details</h3>
              <p style="margin: 5px 0;"><strong>Method:</strong> ${orderPayload.payment_method}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${orderPayload.payment_status}</p>
              <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${orderPayload.payment_id || 'N/A'}</p>

              <h3 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; margin-top: 20px;">Ordered Items</h3>
              <table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Qty</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <div style="margin-top: 30px; font-size: 13px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 15px;">
                <p>You can view and manage this order in the Nuzvid Agri Farms Admin Panel.</p>
              </div>
            </div>
          `
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          await transporter.sendMail(mailOptions);
          console.log('Admin notification email sent successfully!');
        } else {
          console.warn('SMTP_USER and SMTP_PASS are not set. Skipping email notification.');
        }
      } catch (mailError) {
        console.error('Error sending notification email:', mailError);
        // Don't fail the order creation just because email failed
      }
      // ------------------------------

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

