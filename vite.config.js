import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'razorpay-api-mock',
      configureServer(server) {
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
