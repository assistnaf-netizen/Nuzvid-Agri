import { products as localProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import { getDisplayName } from '../utils/productUtils';

let memoryCache = null;
const CACHE_KEY = 'naf_products_cache_v3';

// Automatically clean legacy caches from user browsers
if (typeof window !== 'undefined') {
  try {
    ['naf_products_cache', 'naf_products_cache_v1', 'naf_products_cache_v2'].forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

export const getFallbackProducts = () => {
  return localProducts.map(p => ({
    ...p,
    title: getDisplayName(p.title),
    hoverImage: p.hoverImage || p.image,
    images: (p.images && p.images.length > 0) ? p.images : [p.image],
    isFreeShipping: p.isFreeShipping || false,
    rating: p.rating ?? 5.0,
    reviews: p.reviews ?? 15
  }));
};

/**
 * Fetch products with instant fallback & 2-second timeout.
 * Guarantees 0ms initial load time for products.
 */
export const getProducts = async (forceRefresh = false) => {
  // 1. Check memory cache first
  if (!forceRefresh && memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  // 2. Check localStorage cache
  if (!forceRefresh) {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryCache = parsed;
          // Refresh in background without blocking
          refreshProductsFromSupabase();
          return parsed;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // 3. Fallback immediately to high-speed local data
  const fallback = getFallbackProducts();
  memoryCache = fallback;

  // 4. Try fetching latest from Supabase with strict 2.5s timeout
  refreshProductsFromSupabase();

  return fallback;
};

/**
 * Background fetch with 2.5s timeout so site never hangs
 */
export const refreshProductsFromSupabase = async () => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Supabase fetch timed out')), 2500)
    );

    const fetchPromise = supabase
      .from('products')
      .select('id, name, price, original_price, category, image_url, images, is_featured, is_free_shipping, description, weight, sku, stock_quantity, variants, highlights');

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const { data, error } = result;

    if (error || !data || data.length === 0) {
      return memoryCache || getFallbackProducts();
    }

    const normalized = data.map(p => {
      let imgs = [];
      if (Array.isArray(p.images)) imgs = p.images;
      else if (typeof p.images === 'string') {
        try { imgs = JSON.parse(p.images); } catch (e) { imgs = [p.images]; }
      }
      if (!Array.isArray(imgs)) imgs = [];

      // Check if fallback has better local WebP images
      const fallbackMatch = localProducts.find(lp => lp.id === p.id || lp.title.toLowerCase() === (p.name || '').toLowerCase());
      const primaryImg = (imgs.length > 0 ? imgs[0] : p.image_url) || (fallbackMatch ? fallbackMatch.image : '/products/a2-cow-ghee-1-liter/a2-cow-ghee-1-liter-3.webp');
      const hoverImg = (imgs.length > 1 ? imgs[1] : primaryImg) || (fallbackMatch ? fallbackMatch.hoverImage : primaryImg);
      const allImgs = imgs.length > 0 ? imgs : (fallbackMatch ? fallbackMatch.images : [primaryImg]);

      return {
        id: p.id,
        title: getDisplayName(p.name),
        price: p.price,
        mrp: p.original_price,
        category: p.category,
        image: primaryImg,
        hoverImage: hoverImg,
        images: allImgs,
        description: p.description,
        weight: p.weight,
        sku: p.sku,
        stock_quantity: p.stock_quantity ?? 10,
        variants: p.variants || (fallbackMatch ? fallbackMatch.variants : []),
        highlights: p.highlights || [],
        isNew: p.is_featured,
        sale: p.is_featured,
        isFreeShipping: p.is_free_shipping || false,
        rating: 5.0,
        reviews: 18
      };
    });

    memoryCache = normalized;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('naf_products_updated', { detail: normalized }));
    }

    return normalized;
  } catch (err) {
    // Silent fallback to local products
    return memoryCache || getFallbackProducts();
  }
};

/**
 * Get single product by ID instantly
 */
export const getProductById = async (id) => {
  const all = memoryCache && memoryCache.length > 0 ? memoryCache : getFallbackProducts();
  const match = all.find(p => String(p.id) === String(id));
  if (match) {
    return match;
  }

  // If not found in memory, try background fetch
  const fresh = await refreshProductsFromSupabase();
  return fresh.find(p => String(p.id) === String(id)) || null;
};
