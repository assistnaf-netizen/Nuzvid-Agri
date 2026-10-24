import { products as localProducts } from '../data/products.js';
import { supabase } from '../lib/supabase.js';
import { getDisplayName } from '../utils/productUtils.js';

let memoryCache = null;
const CACHE_KEY = 'naf_products_cache_v6';

// Automatically clean legacy caches from user browsers
if (typeof window !== 'undefined') {
  try {
    ['naf_products_cache', 'naf_products_cache_v1', 'naf_products_cache_v2', 'naf_products_cache_v3', 'naf_products_cache_v4', 'naf_products_cache_v5'].forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

/**
 * Deduplicate and consolidate products so no duplicate cards appear.
 * Merges separate weight variants into a single canonical product.
 */
export const consolidateProducts = (productsList) => {
  if (!Array.isArray(productsList)) return [];

  const canonicalMap = new Map();

  for (const raw of productsList) {
    const rawTitle = (raw.title || raw.name || '').trim();
    const lower = rawTitle.toLowerCase();

    // Determine canonical key and name
    let canonicalKey = null;
    let canonicalTitle = null;

    if (lower.includes('honey')) {
      canonicalKey = 'forest-honey';
      canonicalTitle = 'Forest Honey';
    } else if (lower.includes('jaggery') && lower.includes('powder')) {
      canonicalKey = 'organic-jaggery-powder';
      canonicalTitle = 'Organic Jaggery Powder';
    } else if (lower.includes('jaggery') && !lower.includes('powder')) {
      canonicalKey = 'organic-jaggery';
      canonicalTitle = 'Organic Jaggery';
    } else if (lower.includes('a2') && lower.includes('ghee')) {
      canonicalKey = 'a2-cow-ghee';
      canonicalTitle = 'A2 Cow Ghee';
    } else if (lower.includes('buffalo') && lower.includes('ghee')) {
      canonicalKey = 'buffalo-ghee';
      canonicalTitle = 'Buffalo Ghee';
    } else if (lower.includes('sesame')) {
      canonicalKey = 'sesame-oil';
      canonicalTitle = 'Sesame Oil';
    } else if (lower.includes('groundnut')) {
      canonicalKey = 'groundnut-oil';
      canonicalTitle = 'Groundnut Oil';
    } else if (lower.includes('coconut')) {
      canonicalKey = 'coconut-oil';
      canonicalTitle = 'Coconut Oil';
    } else if (lower.includes('safflower')) {
      canonicalKey = 'safflower-oil';
      canonicalTitle = 'Safflower Oil';
    } else if (lower.includes('mustard')) {
      canonicalKey = 'mustard-oil';
      canonicalTitle = 'Mustard Oil';
    } else if (lower.includes('masala chilli') || lower.includes('curry chilli')) {
      canonicalKey = 'masala-chilli-powder';
      canonicalTitle = 'Masala Chilli Powder';
    } else if (lower.includes('red chilli')) {
      canonicalKey = 'red-chilli-powder';
      canonicalTitle = 'Red Chilli Powder';
    } else if (lower.includes('turmeric')) {
      canonicalKey = 'organic-turmeric-powder';
      canonicalTitle = 'Organic Turmeric Powder';
    } else if (lower.includes('pink salt') || lower.includes('mineral salt')) {
      canonicalKey = 'himalayan-pink-salt';
      canonicalTitle = 'Himalayan Pink Salt';
    } else if (lower.includes('sugar')) {
      canonicalKey = 'organic-natural-sugar';
      canonicalTitle = 'Organic Natural Sugar';
    } else {
      canonicalKey = String(raw.id);
      canonicalTitle = rawTitle;
    }

    // Extract variants from this raw product
    let rawVariants = [];
    if (Array.isArray(raw.variants) && raw.variants.length > 0) {
      rawVariants = raw.variants.map(v => ({
        id: v.id,
        sku: v.sku || raw.sku,
        weight: (v.weight || '').trim() || (raw.weight || 'Standard'),
        price: Number(v.price),
        mrp: Number(v.mrp || v.original_price || v.price),
        stock_quantity: (v.stock_quantity !== undefined && v.stock_quantity !== null)
          ? Number(v.stock_quantity)
          : ((raw.stock_quantity !== undefined && raw.stock_quantity !== null) ? Number(raw.stock_quantity) : 100)
      }));
    } else if (raw.weight) {
      rawVariants = [{
        id: raw.id,
        sku: raw.sku,
        weight: raw.weight,
        price: Number(raw.price),
        mrp: Number(raw.mrp || raw.original_price || raw.price),
        stock_quantity: (raw.stock_quantity !== undefined && raw.stock_quantity !== null) ? Number(raw.stock_quantity) : 100
      }];
    }

    // If title has a weight indicator like "Raw Honey -1 KG" and variant weight was blank, fix it
    if (rawVariants.length === 1 && (!rawVariants[0].weight || rawVariants[0].weight === 'Standard')) {
      if (lower.includes('1 kg')) rawVariants[0].weight = '1 KG';
      else if (lower.includes('900')) rawVariants[0].weight = '900 Grams';
      else if (lower.includes('500')) rawVariants[0].weight = '500 Grams';
      else if (lower.includes('250')) rawVariants[0].weight = '250 Grams';
      else if (raw.weight) rawVariants[0].weight = raw.weight;
    }

    if (!canonicalMap.has(canonicalKey)) {
      canonicalMap.set(canonicalKey, {
        ...raw,
        title: canonicalTitle,
        stock_quantity: (raw.stock_quantity !== undefined && raw.stock_quantity !== null) ? Number(raw.stock_quantity) : 100,
        in_stock: true,
        variants: [...rawVariants]
      });
    } else {
      // Merge variants into existing canonical entry
      const existing = canonicalMap.get(canonicalKey);
      const combinedVariants = [...(existing.variants || [])];

      for (const rv of rawVariants) {
        const vWeight = (rv.weight || '').trim().toLowerCase();
        const foundIndex = combinedVariants.findIndex(v => (v.weight || '').trim().toLowerCase() === vWeight);
        if (foundIndex === -1 && rv.weight) {
          combinedVariants.push(rv);
        } else if (foundIndex !== -1) {
          combinedVariants[foundIndex] = {
            ...combinedVariants[foundIndex],
            ...rv,
            stock_quantity: rv.stock_quantity ?? combinedVariants[foundIndex].stock_quantity ?? 100
          };
        }
      }

      canonicalMap.set(canonicalKey, {
        ...existing,
        stock_quantity: existing.stock_quantity || raw.stock_quantity || 100,
        in_stock: true,
        variants: combinedVariants
      });
    }
  }

  // Ensure each canonical product has sorted variants and proper base display price
  return Array.from(canonicalMap.values()).map(prod => {
    let variants = Array.isArray(prod.variants) ? [...prod.variants] : [];
    
    // Fallback if variants is still empty
    if (variants.length === 0 && prod.weight) {
      variants = [{
        weight: prod.weight,
        price: Number(prod.price),
        mrp: Number(prod.mrp || prod.price),
        stock_quantity: (prod.stock_quantity !== undefined && prod.stock_quantity !== null) ? Number(prod.stock_quantity) : 100
      }];
    }

    // Sort variants by price ascending (cheapest / smallest variant first)
    if (variants.length > 0) {
      variants.sort((a, b) => Number(a.price) - Number(b.price));
    }

    const basePrice = variants.length > 0 ? variants[0].price : prod.price;
    const baseMrp = variants.length > 0 ? (variants[0].mrp || variants[0].price) : (prod.mrp || prod.price);
    const baseWeight = variants.length > 0 ? variants[0].weight : prod.weight;
    const baseStock = variants.length > 0 ? (variants[0].stock_quantity ?? prod.stock_quantity ?? 100) : (prod.stock_quantity ?? 100);

    return {
      ...prod,
      price: basePrice,
      mrp: baseMrp,
      weight: baseWeight,
      stock_quantity: baseStock,
      in_stock: baseStock > 0,
      variants
    };
  });
};

export const getFallbackProducts = () => {
  const normalized = localProducts.map(p => ({
    ...p,
    title: getDisplayName(p.title),
    hoverImage: p.hoverImage || p.image,
    images: (p.images && p.images.length > 0) ? p.images : [p.image],
    isFreeShipping: p.isFreeShipping || false,
    rating: p.rating ?? 5.0,
    reviews: p.reviews ?? 15,
    stock_quantity: (p.stock_quantity !== undefined && p.stock_quantity !== null) ? Number(p.stock_quantity) : 100,
    in_stock: true
  }));
  return consolidateProducts(normalized);
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

    const mapped = data.map(p => {
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
        stock_quantity: (p.stock_quantity !== undefined && p.stock_quantity !== null) ? Number(p.stock_quantity) : 100,
        in_stock: p.in_stock !== undefined ? Boolean(p.in_stock) : true,
        variants: p.variants || (fallbackMatch ? fallbackMatch.variants : []),
        highlights: p.highlights || [],
        isNew: p.is_featured,
        sale: p.is_featured,
        isFreeShipping: p.is_free_shipping || false,
        rating: 5.0,
        reviews: 18
      };
    });

    const consolidated = consolidateProducts(mapped);

    memoryCache = consolidated;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(consolidated));
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('naf_products_updated', { detail: consolidated }));
    }

    return consolidated;
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
