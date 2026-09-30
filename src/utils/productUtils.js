export const getDisplayName = (originalName) => {
  if (!originalName) return "";
  const title = originalName.trim();

  const map = {
    "Bilona A2 Ghee (Cow Ghee) - 500ml": "A2 Cow Ghee 500 ml",
    "Bilona A2 Ghee (Cow Ghee)": "A2 Cow Ghee 1 Liter",
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
  
  if (title.includes("Bilona A2 Ghee (Cow Ghee)")) {
    return [
      "/products/a2-ghee-1.png",
      "/products/a2-ghee-2.png",
      "/products/a2-ghee-3.png",
      "/products/a2-ghee-4.png",
      "/products/a2-ghee-5.png"
    ];
  }
  
  return defaultImages;
};

