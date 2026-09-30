import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES Module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://www.nuzvidagrifarms.com';

const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/products', priority: 0.9, changefreq: 'daily' },
  { url: '/about-us', priority: 0.7, changefreq: 'monthly' },
  { url: '/our-commitment', priority: 0.7, changefreq: 'monthly' },
  { url: '/contact-us', priority: 0.6, changefreq: 'monthly' },
  { url: '/blogs', priority: 0.8, changefreq: 'weekly' }
];

const blogSlugs = [
  'brown-sugar', 'buffalo-ghee', 'mineral-salt', 'real-food',
  'red-chilli', 'turmeric', 'jaggery', 'coldpressed-oils',
  'a2-ghee', 'forest-honey'
];

async function generateSitemap() {
  try {
    console.log("Fetching products from Supabase...");
    const { data: products, error } = await supabase
      .from('products')
      .select('id');

    if (error) {
      throw error;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Blogs
    blogSlugs.forEach(slug => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/blogs/${slug}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    // Products
    if (products && products.length > 0) {
      products.forEach(product => {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/products/${product.id}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    xml += `</urlset>`;

    const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    console.log(`Successfully generated sitemap.xml at ${sitemapPath} with ${products.length} products.`);

  } catch (err) {
    console.error("Error generating sitemap:", err.message);
  }
}

generateSitemap();
