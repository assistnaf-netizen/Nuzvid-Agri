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
                // We use process.env to fetch keys locally
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
      }
    }
  ],
})
