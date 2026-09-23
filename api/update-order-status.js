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

    const orderData = data[0];

    // --- EMAIL NOTIFICATION LOGIC ---
    if (orderData.customer_email) {
      try {
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS?.replace(/"/g, '')
          }
        });

        // Determine status message and color
        let statusColor = '#3b82f6'; // blue
        let statusMessage = 'Your order status has been updated.';
        
        if (status === 'Shipped') {
          statusColor = '#f59e0b'; // yellow/orange
          statusMessage = 'Great news! Your order has been shipped and is on its way.';
        } else if (status === 'Delivered') {
          statusColor = '#10b981'; // green
          statusMessage = 'Your order has been successfully delivered. Thank you for shopping with us!';
        } else if (status === 'Cancelled') {
          statusColor = '#ef4444'; // red
          statusMessage = 'Your order has been cancelled.';
        }

        const mailOptions = {
          from: `"Nuzvid Agri Farms" <${process.env.SMTP_USER}>`,
          to: orderData.customer_email,
          subject: `Order Update: #${orderData.display_id} is now ${status}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: ${statusColor}; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px;">Order Status Update</h2>
              
              <p>Hi <strong>${orderData.customer_name || 'Customer'}</strong>,</p>
              <p>${statusMessage}</p>

              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${statusColor};">
                <h3 style="margin-top: 0; margin-bottom: 10px;">Order Details</h3>
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderData.display_id}</p>
                <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="font-weight: bold; color: ${statusColor};">${status}</span></p>
                <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${orderData.total_amount}</p>
                <p style="margin: 5px 0;"><strong>Shipping Address:</strong> ${orderData.shipping_address}</p>
              </div>

              <p style="font-size: 14px; color: #555;">If you have any questions, feel free to reply to this email or contact our support team.</p>
              
              <div style="margin-top: 30px; font-size: 12px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 15px;">
                <p>Nuzvid Agri Farms</p>
              </div>
            </div>
          `
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          await transporter.sendMail(mailOptions);
          console.log(`Status update email sent to ${orderData.customer_email}`);
        } else {
          console.warn('SMTP_USER and SMTP_PASS are not set. Skipping email notification.');
        }
      } catch (mailError) {
        console.error('Error sending status update email:', mailError);
        // Do not fail the API response if email fails
      }
    }
    // ------------------------------

    return res.status(200).json({ success: true, order: orderData });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
