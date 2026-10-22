export const getDisplayName = (originalName) => {
  if (!originalName) return "";
  const title = originalName.trim();

  const map = {
    "Bilona A2 Ghee (Cow Ghee) - 500ml": "A2 Cow Ghee 500 ml",
    "Bilona A2 Ghee (Cow Ghee)": "A2 Cow Ghee 1 Liter",
    "Bilona A2 Ghee - 500ml": "A2 Cow Ghee 500 ml",
    "Bilona A2 Ghee": "A2 Cow Ghee",
    "Buffalo Ghee": "Buffalo Ghee",
    "Raw Honey -1 KG": "Forest Honey 1 KG",
    "Raw Honey": "Forest Honey",
    "Mineral Salt": "Himalayan Pink Salt",
    "Curry Chilli Powder": "Masala Chilli Powder",
    "Jaggery Block": "Organic Jaggery",
    "Jaggery Powder -900 Grams": "Organic Jaggery Powder - 900 Grams",
    "Jaggery Powder": "Organic Jaggery Powder",
    "Natural Sugar": "Organic Natural Sugar",
    "Turmeric Powder": "Organic Turmeric Powder",
    "Red Chilli Powder": "Red Chilli Powder",
    "Coconut Oil": "Coconut Oil",
    "Groundnut Oil": "Groundnut Oil",
    "Mustard Oil": "Mustard Oil",
    "Safflower Oil": "Safflower Oil",
    "Sesame Oil": "Sesame Oil",
  };

  // Check for exact matches
  if (map[title]) {
    return map[title];
  }

  // Fallback: Check if it contains the keys and replace (for sizes that might not be exactly mapped)
  const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);

  let newTitle = title;
  for (const key of sortedKeys) {
    if (newTitle.includes(key)) {
      newTitle = newTitle.replace(key, map[key]);
      break;
    }
  }

  return newTitle;
};

export const getProductImages = (originalName, defaultImages) => {
  if (!originalName) return defaultImages;
  const title = originalName.trim();
  
  if (title.includes("Bilona A2 Ghee") || title.includes("A2 Cow Ghee") || title.includes("A2 Ghee")) {
    return [
      "/products/a2-cow-ghee-1-liter/a2-cow-ghee-1-liter-3.webp",
      "/products/a2-cow-ghee-1-liter/a2-cow-ghee-1-liter-1.webp",
      "/products/a2-cow-ghee-1-liter/a2-cow-ghee-1-liter-2.webp",
      "/products/a2-cow-ghee-1-liter/a2-cow-ghee-1-liter-4.webp",
      "/products/a2-cow-ghee-1-liter/a2-cow-ghee-1-liter-5.webp"
    ];
  }
  
  return defaultImages;
};

export const getCategoryDisplayName = (category) => {
  if (!category) return '';
  const key = category.toLowerCase().trim();
  const map = {
    'all': 'All Products',
    'wood-pressed-oils': 'Wood Pressed Oils',
    'a2-ghee': 'Pure Desi Ghee',
    'natural-sweeteners': 'Honey & Jaggery',
    'countryside-grocery': 'Spices & Powders',
  };
  return map[key] || category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

