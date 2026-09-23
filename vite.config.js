import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-mocks',
      configureServer(server) {
        // --- OTP Email Mock ---
        server.middlewares.use('/api/send-otp', async (req, res) => {
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const { email, otp } = JSON.parse(body);
                
                if (email !== 'assist.naf@gmail.com') {
                  res.statusCode = 403;
                  res.end(JSON.stringify({ error: 'Unauthorized email' }));
                  return;
                }

                const nodemailer = await import('nodemailer');

                const transporter = nodemailer.default.createTransport({
                  service: 'gmail',
                  auth: {
                    user: process.env.SMTP_USER || 'assist.naf@gmail.com',
                    pass: process.env.SMTP_PASS
                  }
                });

                const mailOptions = {
                  from: `"Nuzvid Agri Farms" <${process.env.SMTP_USER || 'assist.naf@gmail.com'}>`,
                  to: email,
                  subject: 'Admin Login OTP - Nuzvid Agri Farms',
                  html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                      <h2 style="color: #2b5c3a; text-align: center;">Nuzvid Agri Farms</h2>
                      <h3 style="text-align: center;">Admin Panel Access</h3>
                      <p>You requested to login to the admin panel. Please use the following One-Time Password (OTP) to complete your login:</p>
                      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 4px; margin: 20px 0;">
                        <h1 style="letter-spacing: 5px; margin: 0; color: #333;">${otp}</h1>
                      </div>
                      <p>This OTP is valid for a single use. Do not share this code with anyone.</p>
                    </div>
                  `
                };

                await transporter.sendMail(mailOptions);
                
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'OTP sent successfully' }));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          }
        });

        // --- Razorpay Mock ---
        server.middlewares.use('/api/create-order', async (req, res) => {
          if (req.method === 'OPTIONS') {
             res.statusCode = 200;
             res.end();
             return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body);

                if (parsedBody.action === 'save_order') {
                  const { createClient } = await import('@supabase/supabase-js');
                  const supabaseAdmin = createClient(
                    process.env.VITE_SUPABASE_URL,
                    process.env.SUPABASE_SERVICE_ROLE_KEY
                  );

                  const { orderPayload, itemsPayload } = parsedBody;

                  const { data: orderData, error: orderError } = await supabaseAdmin
                    .from('orders')
                    .insert([orderPayload])
                    .select();

                  if (orderError) throw orderError;

                  const realOrderId = orderData[0].id;
                  const itemsToInsert = itemsPayload.map(item => ({ ...item, order_id: realOrderId }));

                  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsToInsert);
                  if (itemsError) throw itemsError;

                  // --- EMAIL NOTIFICATION LOGIC ---
                  try {
                    const nodemailer = await import('nodemailer');
                    const transporter = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS?.replace(/"/g, '')
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
                      to: 'assist.naf@gmail.com',
                      subject: `New Order Received! #${orderPayload.display_id}`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">New Order Received!</h2>
                          
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
                        </div>
                      `
                    };

                    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                      await transporter.sendMail(mailOptions);
                      console.log('Local Dev: Admin notification email sent successfully!');
                    }
                  } catch (mailError) {
                    console.error('Local Dev: Error sending notification email:', mailError);
                  }
                  
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, orderId: realOrderId }));
                  return;
                }

                // Default razorpay order creation
                const key_id = process.env.VITE_RAZORPAY_KEY_ID;
                const key_secret = process.env.RAZORPAY_SECRET;

                if (!key_id || !key_secret) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Razorpay keys missing in .env' }));
                  return;
                }

                const response = await fetch('https://api.razorpay.com/v1/orders', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64')
                  },
                  body: JSON.stringify({
                    amount: Math.round(parsedBody.amount * 100),
                    currency: 'INR',
                    receipt: parsedBody.receipt || `receipt_${Date.now()}`
                  })
                });
                
                const data = await response.json();
                res.setHeader('Content-Type', 'application/json');
                if (!response.ok) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: data.error?.description || 'Failed' }));
                  return;
                }
                res.statusCode = 200;
                res.end(JSON.stringify(data));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          }
        });
        // --- Save Settings Mock ---
        server.middlewares.use('/api/save-settings', async (req, res) => {
          if (req.method === 'OPTIONS') {
             res.statusCode = 200;
             res.end();
             return;
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const parsedBody = JSON.parse(body);
                const { settings } = parsedBody;

                const supabaseUrl = process.env.VITE_SUPABASE_URL;
                const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

                if (!supabaseUrl || !supabaseKey) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Supabase keys missing' }));
                  return;
                }

                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(supabaseUrl, supabaseKey);

                const { data, error } = await supabase.from('store_settings').upsert({
                  id: 1,
                  flat_shipping_rate: Number(settings.flatShippingRate),
                  free_shipping_threshold: Number(settings.freeShippingThreshold),
                  platform_fee: Number(settings.platformFee),
                  updated_at: new Date().toISOString()
                });

                if (error) throw error;

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data }));
              } catch (e) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          }
        });
      }
    }
  ],
})
