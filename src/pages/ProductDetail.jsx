import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { useWishlist } from '../context/WishlistContext';
import { Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import { getDisplayName, getProductImages } from '../utils/productUtils';
import './ProductDetail.css';

const jaggeryBlockShortDesc = "Enjoy organic jaggery made the way it should be, slow-cooked to preserve its natural richness. Packed with essential minerals, it energizes your body and strengthens immunity. Sweeten every meal the healthy, wholesome way and bring care and tradition to your family's table. At Nuzvid Agri Farms, our organic jaggery is...";

const jaggeryBlockLongDesc = (
  <div className="jaggery-long-desc">
    <p>Enjoy organic jaggery made the way it should be, slow-cooked to preserve its natural richness. Packed with essential minerals, it energizes your body and strengthens immunity. Sweeten every meal the healthy, wholesome way and bring care and tradition to your family's table.</p>
    
    <p>At Nuzvid Agri Farms, our organic jaggery is made the way it should be made, slowly and with care. Fresh organic sugarcane juice is boiled in traditional food-grade steel vessels over a wood-fired stove, without any chemicals, whiteners, or refining that takes away its natural richness.</p>
    
    <p>Naturally rich in iron, magnesium, potassium, and essential minerals, this jaggery supports digestion, purifies the blood, boosts energy, and strengthens immunity. A wholesome alternative to refined sugar, it delivers natural sweetness with all its nutrients intact.</p>
    
    <p>Every piece of this jaggery holds the warmth of our roots, a taste that reminds us of our childhood, our elders, and a time when food was made with love, not shortcuts.</p>
    
    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Sweet Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Naturally rich in calcium, iron, and essential minerals</li>
      <li>Provides slow-releasing energy that fuels the body all day</li>
      <li>Supports digestion and helps cleanse the system</li>
      <li>Strengthens immunity with natural nutrients</li>
      <li>Promotes healthy blood circulation and vitality</li>
      <li>A wholesome alternative to refined sugar</li>
      <li>100% pure, chemical-free, and traditionally crafted</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Sugarcane</strong> – Cultivated without pesticides, fertilizers, or harmful chemicals</li>
      <li><strong>Freshly Crushed Juice</strong> – Extracted from matured cane for maximum sweetness</li>
      <li><strong>Slow-Cooked in Steel Vessels</strong> – Preserves natural minerals and authentic taste</li>
      <li><strong>Naturally Solidified</strong> – No refining, bleaching, or additives</li>
      <li><strong>Packed with Care</strong> – Sealed to keep its earthy colour, rich aroma, and natural goodness intact</li>
    </ul>
  </div>
);

const jaggeryPowderShortDesc = "Enjoy organic jaggery made the way it should be, slow-cooked to preserve its natural richness. Packed with essential minerals, it energizes your body and strengthens immunity. Sweeten every meal the healthy, wholesome way and bring care and tradition to your family's table. At Nuzvid Agri Farms, our organic jaggery is...";

const jaggeryPowderLongDesc = (
  <div className="jaggery-powder-long-desc">
    <p>Enjoy organic jaggery made the way it should be, slow-cooked to preserve its natural richness. Packed with essential minerals, it energizes your body and strengthens immunity. Sweeten every meal the healthy, wholesome way and bring care and tradition to your family's table.</p>
    
    <p>At Nuzvid Agri Farms, our organic jaggery is made the way it should be made, slowly and with care. Fresh organic sugarcane juice is boiled in traditional food-grade steel vessels over a wood-fired stove, without any chemicals, whiteners, or refining that takes away its natural richness.</p>
    
    <p>Naturally rich in iron, magnesium, potassium, and essential minerals, this jaggery supports digestion, purifies the blood, boosts energy, and strengthens immunity. A wholesome alternative to refined sugar, it delivers natural sweetness with all its nutrients intact.</p>
    
    <p>Every piece of this jaggery holds the warmth of our roots, a taste that reminds us of our childhood, our elders, and a time when food was made with love, not shortcuts.</p>
    
    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Sweet Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Naturally rich in calcium, iron, and essential minerals</li>
      <li>Provides slow-releasing energy that fuels the body all day</li>
      <li>Supports digestion and helps cleanse the system</li>
      <li>Strengthens immunity with natural nutrients</li>
      <li>Promotes healthy blood circulation and vitality</li>
      <li>A wholesome alternative to refined sugar</li>
      <li>100% pure, chemical-free, and traditionally crafted</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Sugarcane</strong> – Cultivated without pesticides, fertilizers, or harmful chemicals</li>
      <li><strong>Freshly Crushed Juice</strong> – Extracted from matured cane for maximum sweetness</li>
      <li><strong>Slow-Cooked in Steel Vessels</strong> – Preserves natural minerals and authentic taste</li>
      <li><strong>Naturally Solidified</strong> – No refining, bleaching, or additives</li>
      <li><strong>Packed with Care</strong> – Sealed to keep its earthy color, rich aroma, and natural goodness intact</li>
    </ul>
  </div>
);

const naturalSugarShortDesc = "Welcome home the rich, wholesome sweetness of pure natural sugar, unrefined, unprocessed, and untouched by chemicals. It's not just sugar; it's a return to tradition, a taste that nourishes both the body and the soul. At Nuzvid Agri Farms, we believe that the sweetest things in life should be real....";

const naturalSugarLongDesc = (
  <div className="sugar-long-desc">
    <p>Welcome home the rich, wholesome sweetness of pure natural sugar, unrefined, unprocessed, and untouched by chemicals. It's not just sugar; it's a return to tradition, a taste that nourishes both the body and the soul.</p>
    
    <p>At Nuzvid Agri Farms, we believe that the sweetest things in life should be real. Our natural sugar is crafted with love and patience, made from freshly squeezed sugarcane juice and slowly evaporated to preserve its natural goodness. There are no chemicals, no artificial refining, and no shortcuts. What you get is sugar in its most authentic form, infused with natural molasses that bring a deep, rich caramel flavour, as close to nature as it gets.</p>
    
    <p>Unlike refined sugars, our natural sugar holds on to nature's essentials, such as trace minerals like iron, calcium, and potassium, making it a much better choice for your health. It's not just a sweetener; it's a nutrient-rich ingredient that adds layers of flavour while supporting your well-being. Whether it's your morning cup of tea, a homemade dessert, or a traditional dish, our brown sugar elevates your recipes with natural sweetness and wholesome benefits.</p>
    
    <p>Every grain of our natural sugar is a testament to our dedication to sustainable farming and the hardworking hands that make it possible. We partner with local farmers, ensuring fair trade practices and supporting the agricultural community because we believe in giving back to the land that gives us so much. At your table, there's no room for compromise. We believe in honesty, purity, and respect for tradition. Every granule of our brown sugar reflects that commitment, delivering a sweetness that's true to its roots. When you choose Nuzvid Agri Farms, you're choosing more than just sugar; you're choosing the best for you, your family, and the planet.</p>
    
    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Sweet Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Naturally rich in minerals like calcium, iron, and magnesium</li>
      <li>Provides steady, clean energy compared to refined sugar</li>
      <li>Supports digestion with trace molasses content</li>
      <li>Gentle on the body, a wholesome alternative to white sugar</li>
      <li>Enhances flavour in beverages, bakes, and daily cooking</li>
      <li>Unrefined sweetness that nourishes body and mind</li>
      <li>100% pure, chemical-free, and made the natural way</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Sugarcane</strong> – Cultivated without pesticides, chemicals, or synthetic fertilizers</li>
      <li><strong>Carefully Harvested & Crushed</strong> – Juice extracted from fresh, matured cane</li>
      <li><strong>Slow-Cooked to Retain Minerals</strong> – Traditional method preserves natural nutrients and molasses</li>
      <li><strong>Naturally Crystallized</strong> – No bleaching, refining, or artificial additives</li>
      <li><strong>Packed with Care</strong> – Sealed to keep its earthy colour, aroma, and wholesome sweetness intact</li>
    </ul>
  </div>
);

const gheeShortDesc = "Experience the richness of A2 Ghee made from fresh milk using the Bilona method, crafted with care just like in our grandparents’ kitchens. This nutritious superfood, packed with Omega-3, 6, 9, CLA, and essential vitamins, nurtures heart, brain, and immunity. Bring home the taste of tradition and give your family...";

const gheeLongDesc = (
  <div className="ghee-long-desc">
    <p>Experience the richness of A2 Ghee made from fresh milk using the Bilona method, crafted with care just like in our grandparents’ kitchens. This nutritious superfood, packed with Omega-3, 6, 9, CLA, and essential vitamins, nurtures heart, brain, and immunity. Bring home the taste of tradition and give your family wholesome nourishment in every meal.</p>
    
    <p>There is something special about the aroma of pure desi ghee warming on the stove. It brings back memories of childhood, care, and food made with love.</p>
    
    <p>At Nuzvid Agri Farms, we make our A2 Ghee just as it was prepared in our grandparents’ homes. We begin with fresh, non-frozen milk from native cows. The milk is set into curd and gently churned to extract butter, which is carefully fermented and washed with purified water. This butter is then slowly cooked in a Kanchu patra, a traditional bronze vessel, over a low flame on a wood-fired stove, preserving its authentic flavor and nutrients.</p>
    
    <p>This golden ghee is rich in Omega-3, Omega-6, and Omega-9 fatty acids, supporting heart health and brain function. It is naturally packed with Vitamins A, D, E, K, and K12, which promote immunity, bone strength, and hormonal balance. It also contains Butyric Acid, which supports gut health and reduces inflammation, and CLA, which helps maintain healthy metabolism and enhances immunity.</p>
    
    <p>More than an ingredient, our A2 Ghee brings nourishment, balance, and strength to every meal. This is not just ghee; it is tradition, healing, and wholesome goodness brought back to your plate.</p>
    
    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Builds strong immunity with vitamins A, D, E & K</li>
      <li>Omega 3, 6 & 9 support heart and brain health</li>
      <li>CLA enhances fat metabolism, focus, and memory</li>
      <li>Butyric acid improves digestion and heals gut lining</li>
      <li>Anti-inflammatory properties protect joints and strengthen bones</li>
      <li>Rich in carotenoids and antioxidants for vision and vitality</li>
      <li>Nourishes skin, hair, and balances overall wellness naturally</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Native Cow Milk</strong> – Fresh, non-frozen milk sourced from indigenous cows</li>
      <li><strong>Traditional Bilona Method</strong> – Milk set into curd, hand-churned to extract butter</li>
      <li><strong>Slow-Cooked in Bronze Vessels</strong> – Butter simmered gently over wood fire, with no shortcuts</li>
      <li><strong>Pure Nutrition and Golden Aroma</strong> – Rich in CLA, butyric acid, Omega 3-6-9, and vitamins A, D, E & K with authentic taste</li>
    </ul>
  </div>
);

const buffaloGheeShortDesc = "Experience the richness of Buffalo Ghee made from fresh buffalo milk using traditional slow-simmering methods, crafted with care just like in our grandparents' kitchens. This nutritious superfood, packed with vitamins A, D, E, K, and healthy fats, nurtures bones, digestion, and immunity. Bring home the taste of tradition and give...";

const buffaloGheeLongDesc = (
  <div className="buffalo-ghee-long-desc">
    <p>Experience the richness of Buffalo Ghee made from fresh buffalo milk using traditional slow-simmering methods, crafted with care just like in our grandparents' kitchens. This nutritious superfood, packed with vitamins A, D, E, K, and healthy fats, nurtures bones, digestion, and immunity. Bring home the taste of tradition and give your family wholesome nourishment in every meal.</p>

    <p>There's something special about the aroma of pure buffalo ghee warming on the stove it reminds us of childhood, of care, and of food made with love.</p>

    <p>At Nuzvid Agri Farms, we make our Buffalo Ghee just the way it was done in our grandparents' homes. We start with fresh, non-frozen milk from healthy, grass-fed buffaloes. The milk is carefully processed to extract rich cream, which is then slowly simmered over a low flame to release pure ghee. This traditional method ensures that every drop retains its authentic flavor, golden richness, and natural nutrients the same quality our ancestors valued.</p>

    <p>This golden ghee is rich in vitamins A, D, E, and K, essential for immunity, bone strength, and overall wellness. It contains healthy fats that provide sustained energy throughout the day and support digestion by enhancing nutrient absorption. Known for its natural antioxidants, buffalo ghee helps boost immunity and supports joint flexibility. More than just an ingredient, our Buffalo Ghee brings strength, balance, and nourishment to every meal.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Goodness of Buffalo Ghee:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Rich in vitamins A, D, E & K for overall wellness</li>
      <li>High in healthy fats that provide sustained energy</li>
      <li>Supports bone strength and joint flexibility</li>
      <li>Aids digestion and enhances nutrient absorption</li>
      <li>Boosts immunity with natural antioxidants</li>
      <li>A wholesome alternative to refined oils and fats</li>
      <li>100% pure, chemical-free, and carefully crafted</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Farm-Fresh Buffalo Milk</strong> – Collected from healthy, grass-fed buffaloes without hormones or chemicals</li>
      <li><strong>Slow Simmering of Cream</strong> – Fresh cream gently simmered to release natural ghee</li>
      <li><strong>Careful Clarification</strong> – Milk solids separated to retain purity and rich golden texture</li>
      <li><strong>Nutrient-Rich Preservation</strong> – Maintains authentic flavour, aroma, and essential goodness</li>
      <li><strong>Packed with Care</strong> – Sealed to keep its freshness, purity, and traditional richness intact</li>
    </ul>
  </div>
);

const sesameOilShortDesc = "Sesame oil is made from non-hybrid seeds, grown with care by farmers. Slow pressed in wooden chekku to preserve nutrients and purity. A simple choice that brings daily nutrition and lasting health to your family. At Nuzvid Agri Farms, our sesame oil is made using time-honoured methods that preserve the...";

const sesameOilLongDesc = (
  <div className="sesame-oil-long-desc">
    <p>Sesame oil is made from non-hybrid seeds, grown with care by farmers. Slow pressed in wooden chekku to preserve nutrients and purity. A simple choice that brings daily nutrition and lasting health to your family.</p>

    <p>At Nuzvid Agri Farms, our sesame oil is made using time-honoured methods that preserve the true essence of the seed. We work closely with farmers who grow sesame through natural and sustainable practices, ensuring quality with care and tradition at every step.</p>

    <p>Sesame oil is naturally rich in antioxidants, calcium, zinc, magnesium, and Vitamin E. It is valued for its anti-inflammatory and immunity-boosting properties, while also supporting healthy joints, heart health, and skin wellness. In many Indian households, sesame oil was the first choice for baby massages, festive cooking, and daily balance.</p>

    <p>We extract our oil using the traditional wood-pressed chekku method, without the use of heat or chemicals. This keeps its nutrients, flavour, and aroma intact, just as it has been enjoyed for generations.</p>

    <p>When you choose Nuzvid Agri Farms, you are choosing more than just oil. You are bringing home a legacy that honours health, nature, and the farmers who make it possible.</p>

    <p style={{fontStyle: 'italic', color: '#6b7280', fontSize: '14px'}}>Note: Every product is packed in carefully chosen food-grade materials to ensure complete safety for your family. Our containers are fully recyclable and reusable, reflecting our effort to reduce environmental impact while delivering the highest quality to your home.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Retains natural antioxidants and vitamin E for strong immunity</li>
      <li>Cold-pressed method preserves essential fatty acids and nutrients</li>
      <li>Supports heart health with balanced Omega 3 and 6</li>
      <li>Aids smooth digestion and improves metabolism</li>
      <li>Promotes skin glow and strengthens hair naturally</li>
      <li>Provides steady energy with wholesome, chemical-free purity</li>
      <li>100% natural, unrefined, and free from preservatives</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Seeds and Nuts</strong> – Sourced from trusted farms, free from chemicals and pesticides</li>
      <li><strong>Wooden Cold-Pressed Extraction</strong> – Seeds pressed slowly at low temperature, no heat or chemicals</li>
      <li><strong>Nutrient-Rich Pure Oil</strong> – Retains natural aroma, flavour, antioxidants, and nutrients</li>
      <li><strong>Unrefined and Untouched</strong> – No bleaching, deodorizing, or refining</li>
      <li><strong>Packed with Care</strong> – Sealed to preserve freshness, purity, and natural goodness</li>
    </ul>
  </div>
);

const coconutOilShortDesc = "Our extra virgin coconut oil begins with non-hybrid coconuts, hand-picked at the right maturity and naturally dried with care, then wood cold-pressed to lock in nutrients. Promotes heart and brain health, boosts immunity, and nourishes skin and hair—a bottle of daily care for your family. At Nuzvid Agri Farms, we...";

const coconutOilLongDesc = (
  <div className="coconut-oil-long-desc">
    <p>Our extra virgin coconut oil begins with non-hybrid coconuts, hand-picked at the right maturity and naturally dried with care, then wood cold-pressed to lock in nutrients. Promotes heart and brain health, boosts immunity, and nourishes skin and hair—a bottle of daily care for your family.</p>

    <p>At Nuzvid Agri Farms, we believe good oil begins with the right coconut. We carefully select naturally dried kurudi coconuts, handpicked at the right stage of maturity to ensure purity and quality. Only the best are chosen, with no chemical ripening, no shortcuts, and no middlemen.</p>

    <p>Our extra virgin coconut oil is extracted using the traditional wood-pressed chekku method. This slow, heat-free process preserves the natural aroma, flavour, and nutrients of the coconut. Nothing is added and nothing is taken away, keeping it just as nature intended.</p>

    <p>Rich in Lauric Acid, Medium Chain Fatty Acids, and Vitamin E, coconut oil is known to support heart health, improve metabolism, strengthen immunity, and nourish skin and hair. It has also been valued for its ability to support brain function and memory, making it a natural ally against conditions like dementia.</p>

    <p>For generations, coconut oil has been trusted in kitchens and homes as a source of cooking, care, and wellness. With every bottle of Nuzvid Agri Farms extra virgin coconut oil, you choose purity, tradition, and a promise of care that honours both health and heritage.</p>

    <p style={{fontStyle: 'italic', color: '#6b7280', fontSize: '14px'}}>Note: Every product is packed in carefully chosen food-grade materials to ensure complete safety for your family. Our containers are fully recyclable and reusable, reflecting our effort to reduce environmental impact while delivering the highest quality to your home.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Retains natural antioxidants and vitamin E for strong immunity</li>
      <li>Cold-pressed method preserves essential fatty acids and nutrients</li>
      <li>Supports heart health with balanced Omega 3 and 6</li>
      <li>Aids smooth digestion and improves metabolism</li>
      <li>Promotes skin glow and strengthens hair naturally</li>
      <li>Provides steady energy with wholesome, chemical-free purity</li>
      <li>100% natural, unrefined, and free from preservatives</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Seeds and Nuts</strong> – Sourced from trusted farms, free from chemicals and pesticides</li>
      <li><strong>Wooden Cold-Pressed Extraction</strong> – Seeds pressed slowly at low temperature, no heat or chemicals</li>
      <li><strong>Nutrient-Rich Pure Oil</strong> – Retains natural aroma, flavour, antioxidants, and nutrients</li>
      <li><strong>Unrefined and Untouched</strong> – No bleaching, deodorizing, or refining</li>
      <li><strong>Packed with Care</strong> – Sealed to preserve freshness, purity, and natural goodness</li>
    </ul>
  </div>
);

const mustardOilShortDesc = "Experience the richness of non-hybrid mustard seeds, nurtured naturally by caring farmers. Cold-pressed to preserve their full flavour and nutrients, this oil brings the goodness of tradition to every meal and homemade pickle. Make every meal wholesome, nutritious, and a heartfelt gesture of care for your family. Our mustard oil...";

const mustardOilLongDesc = (
  <div className="mustard-oil-long-desc">
    <p>Experience the richness of non-hybrid mustard seeds, nurtured naturally by caring farmers. Cold-pressed to preserve their full flavour and nutrients, this oil brings the goodness of tradition to every meal and homemade pickle. Make every meal wholesome, nutritious, and a heartfelt gesture of care for your family.</p>

    <p>Our mustard oil starts with non-hybrid mustard seeds, carefully grown by dedicated farmers who follow natural cultivation methods. Each seed is hand-selected to ensure purity, richness, and the authentic flavour that has been cherished for generations.</p>

    <p>Cold-pressed using traditional methods, the oil retains all its nutrients, natural compounds, and aroma. Rich in antioxidants and healthy fats, it supports heart health, improves digestion, and enhances the taste of every meal, from everyday cooking to homemade pickles.</p>

    <p>A thoughtful choice for your family, our mustard oil brings nutrition, flavour, and care to your kitchen. Every drop reflects tradition and love, making each meal wholesome and memorable.</p>

    <p style={{fontStyle: 'italic', color: '#6b7280', fontSize: '14px'}}>Note: Every product is packed in carefully chosen food-grade materials to ensure complete safety for your family. Our containers are fully recyclable and reusable, reflecting our effort to reduce environmental impact while delivering the highest quality to your home.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Retains natural antioxidants and vitamin E for strong immunity</li>
      <li>Cold-pressed method preserves essential fatty acids and nutrients</li>
      <li>Supports heart health with balanced Omega 3 and 6</li>
      <li>Aids smooth digestion and improves metabolism</li>
      <li>Promotes skin glow and strengthens hair naturally</li>
      <li>Provides steady energy with wholesome, chemical-free purity</li>
      <li>100% natural, unrefined, and free from preservatives</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Seeds and Nuts</strong> – Sourced from trusted farms, free from chemicals and pesticides</li>
      <li><strong>Wooden Cold-Pressed Extraction</strong> – Seeds pressed slowly at low temperature, no heat or chemicals</li>
      <li><strong>Nutrient-Rich Pure Oil</strong> – Retains natural aroma, flavour, antioxidants, and nutrients</li>
      <li><strong>Unrefined and Untouched</strong> – No bleaching, deodorizing, or refining</li>
      <li><strong>Packed with Care</strong> – Sealed to preserve freshness, purity, and natural goodness</li>
    </ul>
  </div>
);

const groundnutOilShortDesc = "Groundnuts are grown from native, non-hybrid seeds by farmers who care for the soil. Gently wood cold-pressed so the natural nutrients and purity stay alive in every drop. Every drop is the result of our honest work, reaching your home with health and goodness. At Nuzvid Agri Farms, our groundnut...";

const groundnutOilLongDesc = (
  <div className="groundnut-oil-long-desc">
    <p>Groundnuts are grown from native, non-hybrid seeds by farmers who care for the soil. Gently wood cold-pressed so the natural nutrients and purity stay alive in every drop. Every drop is the result of our honest work, reaching your home with health and goodness.</p>

    <p>At Nuzvid Agri Farms, our groundnut oil is a tribute to the farmers who grow peanuts with care and respect for the earth. We work directly with trusted farmers who follow natural farming methods, so every drop is pure, free from chemicals, and untouched by middlemen.</p>

    <p>Groundnut oil is rich in heart-healthy monounsaturated fats and antioxidants like Vitamin E. It helps lower bad cholesterol, supports heart health, aids digestion, and strengthens immunity. Its light, nutty flavour brings out the best in every dish and reminds us of the simple, wholesome food we grew up with.</p>

    <p>We take pride in preserving traditional cold-press methods to extract oil, keeping all its natural goodness intact gently. With Nuzvid Agri Farms' groundnut oil, you're choosing health, tradition, and a promise that the farmer's hard work reaches your kitchen directly.</p>

    <p style={{fontStyle: 'italic', color: '#6b7280', fontSize: '14px'}}>Note: Every product is packed in carefully chosen food-grade materials to ensure complete safety for your family. Our containers are fully recyclable and reusable, reflecting our effort to reduce environmental impact while delivering the highest quality to your home.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Retains natural antioxidants and vitamin E for strong immunity</li>
      <li>Cold-pressed method preserves essential fatty acids and nutrients</li>
      <li>Supports heart health with balanced Omega 3 and 6</li>
      <li>Aids smooth digestion and improves metabolism</li>
      <li>Promotes skin glow and strengthens hair naturally</li>
      <li>Provides steady energy with wholesome, chemical-free purity</li>
      <li>100% natural, unrefined, and free from preservatives</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Seeds and Nuts</strong> – Sourced from trusted farms, free from chemicals and pesticides</li>
      <li><strong>Wooden Cold-Pressed Extraction</strong> – Seeds pressed slowly at low temperature, no heat or chemicals</li>
      <li><strong>Nutrient-Rich Pure Oil</strong> – Retains natural aroma, flavour, antioxidants, and nutrients</li>
      <li><strong>Unrefined and Untouched</strong> – No bleaching, deodorizing, or refining</li>
      <li><strong>Packed with Care</strong> – Sealed to preserve freshness, purity, and natural goodness</li>
    </ul>
  </div>
);

const safflowerOilShortDesc = "Our Safflower oil begins with farmers who grow non-hybrid crops with care. It is wood cold-pressed to preserve natural goodness and nutrients. The result is a light, heart-friendly oil for everyday cooking. At Nuzvid Agri Farms, our safflower oil begins in fields where crops are grown naturally and cared for...";

const safflowerOilLongDesc = (
  <div className="safflower-oil-long-desc">
    <p>Our Safflower oil begins with farmers who grow non-hybrid crops with care. It is wood cold-pressed to preserve natural goodness and nutrients. The result is a light, heart-friendly oil for everyday cooking.</p>

    <p>At Nuzvid Agri Farms, our safflower oil begins in fields where crops are grown naturally and cared for by farmers who believe in clean soil and chemical-free practices. We work directly with these farmers and carefully select the highest quality safflower seeds, ensuring quality without middlemen or shortcuts.</p>

    <p>What sets our safflower oil apart is the way it is made. Using the traditional wood-pressed chekku method, the oil is extracted slowly without heat, preserving its natural flavour and nutrients.</p>

    <p>Safflower oil is naturally rich in Omega-6 fatty acids, linoleic acid, and Vitamin E. It is known to support heart health, maintain balanced cholesterol levels, and aid in weight management. Its light, neutral taste makes it a perfect choice for everyday cooking, especially for those looking for a heart-healthy diet.</p>

    <p>By choosing Nuzvid Agri Farms safflower oil, you are bringing home more than just a cooking ingredient. You are supporting mindful farming, traditional methods, and a way of health that stays true to the soil it comes from.</p>

    <p style={{fontStyle: 'italic', color: '#6b7280', fontSize: '14px'}}>Note: Every product is packed in carefully chosen food-grade materials to ensure complete safety for your family. Our containers are fully recyclable and reusable, reflecting our effort to reduce environmental impact while delivering the highest quality to your home.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Retains natural antioxidants and vitamin E for strong immunity</li>
      <li>Cold-pressed method preserves essential fatty acids and nutrients</li>
      <li>Supports heart health with balanced Omega 3 and 6</li>
      <li>Aids smooth digestion and improves metabolism</li>
      <li>Promotes skin glow and strengthens hair naturally</li>
      <li>Provides steady energy with wholesome, chemical-free purity</li>
      <li>100% natural, unrefined, and free from preservatives</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Grown Seeds and Nuts</strong> – Sourced from trusted farms, free from chemicals and pesticides</li>
      <li><strong>Wooden Cold-Pressed Extraction</strong> – Seeds pressed slowly at low temperature, no heat or chemicals</li>
      <li><strong>Nutrient-Rich Pure Oil</strong> – Retains natural aroma, flavour, antioxidants, and nutrients</li>
      <li><strong>Unrefined and Untouched</strong> – No bleaching, deodorizing, or refining</li>
      <li><strong>Packed with Care</strong> – Sealed to preserve freshness, purity, and natural goodness</li>
    </ul>
  </div>
);

const curryChilliPowderShortDesc = "Ignite your meals with the bold flavour of pure, naturally grown chillies. Hand-pounded to preserve their natural heat and aroma, our Masala Chilly Powder adds vibrant colour, rich taste, and wholesome goodness, bringing warmth and energy to every family dish. At Nuzvid Agri Farms, our Masala Chilly Powder is made...";

const curryChilliPowderLongDesc = (
  <div className="curry-chilli-powder-long-desc">
    <p>Ignite your meals with the bold flavour of pure, naturally grown chillies. Hand-pounded to preserve their natural heat and aroma, our Masala Chilly Powder adds vibrant colour, rich taste, and wholesome goodness, bringing warmth and energy to every family dish.</p>

    <p>At Nuzvid Agri Farms, our Masala Chilly Powder is made from naturally grown, non-hybrid chillies that are carefully hand-picked at the right maturity. Sun-dried with patience and stone-ground in small batches, it carries the authentic fiery colour and aroma that comes only from nature, with no added colours or preservatives.</p>

    <p>Chillies are more than just spice; they are a natural source of antioxidants, Vitamin C, and essential minerals that help improve metabolism, support circulation, and enhance immunity. Known for their warming properties, they not only add heat and depth to food but also stimulate appetite and support overall digestion.</p>

    <p>This Masala Chilly Powder brings the bold, pure taste of tradition to your kitchen. Every spoonful carries freshness, flavour, and health, making your meals vibrant and full of life. Bring home the spice that awakens the senses and nourishes the body.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Fiery Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Capsaicin-rich spice that boosts metabolism and supports weight management</li>
      <li>Natural antioxidants strengthen immunity and fight oxidative stress</li>
      <li>Promotes healthy blood circulation and heart wellness</li>
      <li>Aids digestion and stimulates appetite naturally</li>
      <li>Contains vitamins A & C for eye, skin, and overall vitality</li>
      <li>Natural anti-inflammatory properties that ease muscle stiffness</li>
      <li>100% pure, chemical-free, and bursting with authentic Guntur heat</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Cultivated in Guntur Farms</strong> – Grown in the fertile soils of Andhra, free from chemicals and pesticides</li>
      <li><strong>Handpicked with Care</strong> – Harvested at peak ripeness for maximum flavour and colour</li>
      <li><strong>Sun-Dried Naturally</strong> – Preserves fiery heat, vibrant red colour, and nutrient value</li>
      <li><strong>Stone-Grounded to Fine Powder</strong> – Traditional grinding method locks in aroma and freshness</li>
      <li><strong>Packed with Care</strong> – Sealed to keep its natural colour, bold flavour, and spicy goodness intact</li>
    </ul>
  </div>
);

const redChilliPowderShortDesc = "Ignite your meals with the bold flavor of pure, naturally grown chillies. Hand-pounded to preserve their natural heat and aroma, our Red Chilly Powder adds vibrant color, rich taste, and wholesome goodness, bringing warmth and energy to every family dish. At Nuzvid Agri Farms, our Red Chilly Powder is made...";

const redChilliPowderLongDesc = (
  <div className="red-chilli-powder-long-desc">
    <p>Ignite your meals with the bold flavor of pure, naturally grown chillies. Hand-pounded to preserve their natural heat and aroma, our Red Chilly Powder adds vibrant color, rich taste, and wholesome goodness, bringing warmth and energy to every family dish.</p>

    <p>At Nuzvid Agri Farms, our Red Chilly Powder is made from naturally grown, non-hybrid chillies that are carefully hand-picked at the right maturity. Sun-dried with patience and stone-ground in small batches, it carries the authentic fiery color and aroma that comes only from nature, with no added colors or preservatives.</p>

    <p>Chillies are more than just spice; they are a natural source of antioxidants, Vitamin C, and essential minerals that help improve metabolism, support circulation, and enhance immunity. Known for their warming properties, they not only add heat and depth to food but also stimulate appetite and support overall digestion.</p>

    <p>This Red Chilly Powder brings the bold, pure taste of tradition to your kitchen. Every spoonful carries freshness, flavor, and health, making your meals vibrant and full of life. Bring home the spice that awakens the senses and nourishes the body.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Fiery Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Capsaicin-rich spice that boosts metabolism and supports weight management</li>
      <li>Natural antioxidants strengthen immunity and fight oxidative stress</li>
      <li>Promotes healthy blood circulation and heart wellness</li>
      <li>Aids digestion and stimulates appetite naturally</li>
      <li>Contains vitamins A & C for eye, skin, and overall vitality</li>
      <li>Natural anti-inflammatory properties that ease muscle stiffness</li>
      <li>100% pure, chemical-free, and bursting with authentic Guntur heat</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Organically Cultivated in Guntur Farms</strong> – Grown in the fertile soils of Andhra, free from chemicals and pesticides</li>
      <li><strong>Handpicked with Care</strong> – Harvested at peak ripeness for maximum flavor and color</li>
      <li><strong>Sun-Dried Naturally</strong> – Preserves fiery heat, vibrant red color, and nutrient value</li>
      <li><strong>Stone-Grounded to Fine Powder</strong> – Traditional grinding method locks in aroma and freshness</li>
      <li><strong>Packed with Care</strong> – Sealed to keep its natural color, bold flavor, and spicy goodness intact</li>
    </ul>
  </div>
);

const turmericPowderShortDesc = "Brighten your meals with the purity of nature's golden spice, trusted in Ayurveda for centuries. Our Turmeric Powder is a true superfood that nurtures health, strengthens immunity, and brings warmth and care to your family's table. At Nuzvid Agri Farms, our Turmeric Powder is crafted with purity at its heart....";

const turmericPowderLongDesc = (
  <div className="turmeric-powder-long-desc">
    <p>Brighten your meals with the purity of nature's golden spice, trusted in Ayurveda for centuries. Our Turmeric Powder is a true superfood that nurtures health, strengthens immunity, and brings warmth and care to your family's table.</p>

    <p>At Nuzvid Agri Farms, our Turmeric Powder is crafted with purity at its heart. Made from naturally grown turmeric roots, it carries the authentic golden colour that comes only from nature itself, with no artificial colours or additives. Every pinch is pure and natural, bringing you the original taste and aroma trusted for generations.</p>

    <p>Turmeric has been celebrated in Ayurveda for its healing strength and is recognized today as a true superfood. Rich in curcumin, it helps build immunity, supports digestion, and improves skin health. Known for its natural anti-inflammatory and antioxidant properties, it contributes to overall vitality and long-term wellness. Beyond health, it adds warmth, depth, and authentic flavour to every dish, making your meals both wholesome and nourishing.</p>

    <p>This is more than a spice; it is tradition, health, and purity brought to your kitchen with care. With every use, you bring home the goodness of Ayurveda and the strength of a superfood that your family deserves.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Curcumin-rich spice supports strong natural immunity</li>
      <li>Potent antioxidants help combat daily oxidative stress</li>
      <li>Natural anti-inflammatory properties ease joint and muscle health</li>
      <li>Aids healthy digestion and promotes liver detox</li>
      <li>Boosts skin radiance and support wound healing</li>
      <li>Enhances brain function and overall vitality</li>
      <li>100% pure, chemical-free, and packed with nature's golden goodness</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Naturally Cultivated in Organic Farms</strong> – Grown without pesticides, fertilizers, or chemicals</li>
      <li><strong>Carefully Harvested Rhizomes</strong> – Picked at the right maturity to preserve potency</li>
      <li><strong>Gentle Cleaning & Sun Drying</strong> – Retains essential curcumin and natural aroma</li>
      <li><strong>Stone-Grounded to Fine Powder</strong> – Traditional method for maximum freshness and purity</li>
      <li><strong>Packed with Care</strong> – Sealed to keep its golden colour, aroma, and health intact</li>
    </ul>
  </div>
);

const rawHoneyShortDesc = "Our Forest Honey comes straight from nature, collected responsibly without harming bees or disturbing the forest ecosystem. Raw, unfiltered, and packed with natural enzymes, antioxidants, and antibacterial goodness, it nurtures immunity, digestion, and natural energy. Bring home pure, wholesome honey and taste the gift of nature in every drop. At...";

const rawHoneyLongDesc = (
  <div className="raw-honey-long-desc">
    <p>Our Forest Honey comes straight from nature, collected responsibly without harming bees or disturbing the forest ecosystem. Raw, unfiltered, and packed with natural enzymes, antioxidants, and antibacterial goodness, it nurtures immunity, digestion, and natural energy. Bring home pure, wholesome honey and taste the gift of nature in every drop.</p>

    <p>At Nuzvid Agri Farms, our Forest Honey comes straight from nature, untouched, unprocessed, and full of goodness. Collected by experienced farmers from naturally grown forest areas, this honey is raw, unfiltered, and free from chemicals or heat. What you receive is honey in its purest form, just as nature made it.</p>

    <p>Every drop is rich in natural enzymes, antioxidants, and antibacterial properties. It helps boost immunity, supports digestion, soothes sore throats, and provides clean, natural energy. Since it's not processed or refined, all the original nutrients remain intact, giving you real taste and real health benefits.</p>

    <p>This isn't just honey. It's nature's gift, brought to your home with care, for those who believe in honest, wholesome living.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Golden Wellness Wonders:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Raw honey rich in live enzymes that build natural immunity</li>
      <li>Antioxidants in every drop help fight oxidative stress</li>
      <li>Naturally antibacterial, soothing sore throats and supporting lungs</li>
      <li>Slow-releasing sugars provide clean, steady daily energy</li>
      <li>Active enzymes aid smooth digestion and gut balance</li>
      <li>Mineral-rich sweetness restores strength and everyday wellness</li>
      <li>100% pure, unheated, and unprocessed to keep nature's full goodness intact</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Naturally Sourced from Forests</strong> – Collected from wild, pesticide-free floral regions</li>
      <li><strong>Hand-Harvested with Care</strong> – Gathered by experienced beekeepers, respecting nature's rhythm</li>
      <li><strong>Raw & Untouched Purity</strong> – No heating, no filtering, no additives, honey as it is</li>
      <li><strong>Rich in Enzymes & Antioxidants</strong> – Boosts immunity while preserving authentic flavour and aroma</li>
      <li><strong>Packed with Care</strong> – Sealed to retain its golden colour, aroma, and natural wellness</li>
    </ul>
  </div>
);

const mineralSaltShortDesc = "Welcome home the pure, mineral-rich taste of Himalayan pink salt, harvested from ancient sea beds deep within the Himalayan mountains. Formed over millions of years and untouched by modern pollution, this salt is as natural and pristine as it gets. At Nuzvid Agri Farms, we believe true wellness begins with...";

const mineralSaltLongDesc = (
  <div className="mineral-salt-long-desc">
    <p>Welcome home the pure, mineral-rich taste of Himalayan pink salt, harvested from ancient sea beds deep within the Himalayan mountains. Formed over millions of years and untouched by modern pollution, this salt is as natural and pristine as it gets.</p>

    <p>At Nuzvid Agri Farms, we believe true wellness begins with what you bring into your kitchen. That's why our Himalayan pink salt is sourced responsibly, hand-mined, and left unrefined free from additives, bleaching, or processing.</p>

    <p>Every crystal carries the natural blush of iron-rich minerals, giving it its distinctive pink hue and subtle, balanced flavor. Unlike regular table salt, Himalayan pink salt retains up to 84 trace minerals including magnesium, calcium, and potassium, supporting hydration, electrolyte balance, and overall health. It's a salt that not only enhances your food but also nurtures your well-being from the inside out.</p>

    <p>Whether you're seasoning a salad, finishing a gourmet dish, or adding it to wellness rituals like salt baths or detox drinks, our Himalayan pink salt brings both purity and purpose to everyday life. It's more than an ingredient it's a connection to nature's original source of nourishment.</p>

    <p>Every grain we offer reflects our commitment to authenticity, health, and responsible sourcing. We work closely with ethical suppliers and local communities to ensure that what reaches your table is not only of the highest quality but also rooted in care and respect for the earth. When you choose Nuzvid Agri Farms, you choose wellness, integrity, and the simple luxury of nature at its best.</p>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Himalayan Mineral Salt – Nature's Pure Essence:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li>Harvested from ancient Himalayan salt mines, rich in 80+ trace minerals</li>
      <li>Naturally mineral-rich crystals that support electrolyte balance & hydration</li>
      <li>Mined gently, free from chemicals, additives, or refining</li>
      <li>Preserves natural flavor & purity in every grain</li>
    </ul>

    <h4 style={{marginTop: '20px', fontWeight: 'bold'}}>Traditional Purity Process:</h4>
    <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px', lineHeight: '1.8'}}>
      <li><strong>Hand-mined</strong> from salt beds formed millions of years ago</li>
      <li><strong>Unrefined & raw</strong>, never bleached or chemically processed</li>
      <li><strong>Retains natural color</strong>, balanced flavor & elemental purity</li>
      <li><strong>Each crystal maintains</strong> its authentic mineral integrity</li>
    </ul>
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    const fetchShipping = async () => {
      const { data } = await supabase.from('store_settings').select('free_shipping_threshold').eq('id', 1).single();
      if (data) setFreeShippingThreshold(data.free_shipping_threshold);
    };
    fetchShipping();
  }, []);



  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        const getWeightValue = (weightStr) => {
          if (!weightStr) return Number.MAX_SAFE_INTEGER;
          const w = weightStr.toLowerCase();
          const match = w.match(/([\d.]+)/);
          if (!match) return Number.MAX_SAFE_INTEGER;
          let val = parseFloat(match[1]);
          if (w.includes('kg') || w.includes('liter') || w.includes('litre')) {
            val *= 1000;
          }
          return val;
        };

        const sortedVariants = (data.variants || []).sort((a, b) => getWeightValue(a.weight) - getWeightValue(b.weight));

        const foundProduct = {
          id: data.id,
          title: getDisplayName(data.name),
          price: data.price,
          mrp: data.original_price,
          category: data.category,
          image: data.image_url || 'https://placehold.co/600x600/f9fafb/9ca3af?text=No+Image',
          images: getProductImages(data.name, (() => {
            let imgs = [];
            if (Array.isArray(data.images)) imgs = data.images;
            else if (typeof data.images === 'string') {
              try { imgs = JSON.parse(data.images); } catch(e) { imgs = [data.images]; }
            }
            if (!Array.isArray(imgs)) imgs = [];
            return imgs.length > 0 ? imgs : (data.image_url ? [data.image_url] : ['https://placehold.co/600x600/f9fafb/9ca3af?text=No+Image']);
          })()),
          description: data.description,
          sku: data.sku,
          weight: data.weight,
          stock_quantity: data.stock_quantity !== null ? data.stock_quantity : 10,
          highlights: data.highlights || [],
          variants: sortedVariants,
          isNew: data.is_featured,
          sale: data.is_featured,
          isFreeShipping: data.is_free_shipping || false,
          rating: 5.0,
          reviews: 12
        };
        setProduct(foundProduct);
        if (foundProduct.variants && foundProduct.variants.length > 0) {
          setSelectedVariant(foundProduct.variants[0]);
        }
        setCurrentImageIndex(0);

        let recentlyViewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        recentlyViewed = recentlyViewed.filter(pId => pId !== foundProduct.id);
        recentlyViewed.unshift(foundProduct.id);
        if (recentlyViewed.length > 4) recentlyViewed.pop();
        localStorage.setItem('recently_viewed', JSON.stringify(recentlyViewed));

        // Fetch related products
        const { data: relatedData } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(4);
        if (relatedData) {
          setRelatedProducts(relatedData.map(rp => ({
             id: rp.id,
             title: getDisplayName(rp.name),
             price: rp.price,
             mrp: rp.original_price,
             category: rp.category,
             image: rp.image_url,
             hoverImage: rp.image_url,
             description: rp.description,
             isNew: rp.is_featured,
             sale: rp.is_featured,
             isFreeShipping: rp.is_free_shipping || false,
             rating: 5.0,
             reviews: 12
          })));
        }
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-not-found" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#d68d3c', marginBottom: '20px' }} />
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <Link to="/collections/all" className="btn-primary mt-4">Return to Shop</Link>
      </div>
    );
  }

  const displayStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < displayStock) setQuantity(q => q + 1);
    if (type === 'decrement' && quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    const finalWeight = selectedVariant ? selectedVariant.weight : product.weight;
    const finalPrice = selectedVariant ? selectedVariant.price : product.price;
    const finalMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
    addToCart({
      ...product,
      cartItemId: `${product.id}-${finalWeight || 'base'}`,
      price: finalPrice,
      mrp: finalMrp,
      image: product.image,
      weight: finalWeight,
      sku: selectedVariant ? selectedVariant.sku : product.sku,
      isFreeShipping: product.isFreeShipping
    }, quantity);
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const displaySku = selectedVariant ? selectedVariant.sku : product.sku;
  const displayWeight = selectedVariant ? selectedVariant.weight : product.weight;

  return (
    <div className="product-detail-page">
      {product && (
        <SEO 
          title={product.title}
          description={product.description}
          image={product.image}
          type="product"
          productSchema={{
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title,
            "image": product.image,
            "description": product.description,
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "INR",
              "price": product.price,
              "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            }
          }}
        />
      )}
      {/* Breadcrumb */}
      <div className="detail-breadcrumb">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#4b5563', fontWeight: 600, marginRight: '16px' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <Link to="/">Home</Link> <ChevronRight size={14} /> 
          <Link to="/collections/all">Products</Link> <ChevronRight size={14} /> 
          <span className="current">{product.title}</span>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row detail-main-row">
          
          {/* Left Column: Image Gallery */}
          <div className="col-lg-6 col-md-12">
            <div className="detail-gallery">
              <div className="detail-main-img-wrapper" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px' }}>
                {product.sale && <span className="detail-badge sale">Sale</span>}
                {product.isNew && <span className="detail-badge new">New</span>}
                <button 
                  className={`detail-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  style={{ position: 'absolute', right: '15px', top: '15px', zIndex: 10, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: '8px', border: 'none', display: 'flex' }}
                >
                  <Heart size={20} fill={isWishlisted ? "var(--color-primary)" : "none"} color={isWishlisted ? "var(--color-primary)" : "#333"} />
                </button>
                <img src={product.images[currentImageIndex] || product.image} alt={product.title} fetchpriority="high" className="detail-main-img" style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain', display: 'block' }} />
              </div>
              
              <div className="detail-thumbnails" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                {product.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail ${currentImageIndex === idx ? 'active' : ''}`} 
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{ 
                      width: '80px', height: '80px', border: currentImageIndex === idx ? '2px solid var(--color-primary)' : '1px solid #e5e7eb',
                      borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', flexShrink: 0
                    }}
                  >
                    <img src={img} alt={`${product.title} ${idx + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="col-lg-6 col-md-12">
            <div className="detail-info">
              <h1 className="detail-title">{product.title}</h1>
              
              <div className="detail-rating-wrapper">
                <div className="detail-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(product.rating) ? "var(--color-secondary)" : "none"}
                      color={i < Math.floor(product.rating) ? "var(--color-secondary)" : "#ccc"}
                    />
                  ))}
                </div>
                <span className="detail-reviews">{product.reviews} reviews</span>
              </div>

              <div className="detail-price-wrapper">
                {displayMrp && displayMrp > displayPrice && (
                  <span className="detail-price-old">₹{Number(displayMrp).toFixed(2)}</span>
                )}
                <span className="detail-price">₹{Number(displayPrice).toFixed(2)}</span>
                {displayMrp && displayMrp > displayPrice && (
                  <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '10px', fontSize: '14px' }}>
                    {Math.round(((displayMrp - displayPrice) / displayMrp) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', color: '#4b5563' }}>Select Size / Weight</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {product.variants.map((v, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                        style={{ 
                          padding: '8px 16px', 
                          border: selectedVariant?.weight === v.weight ? '2px solid var(--color-primary)' : '1px solid #d1d5db', 
                          background: selectedVariant?.weight === v.weight ? '#fef3c7' : 'white',
                          color: selectedVariant?.weight === v.weight ? '#92400e' : '#4b5563',
                          borderRadius: '8px', 
                          fontWeight: 600, 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {v.weight}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Specs (SKU, Weight) */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px', color: '#4b5563' }}>
                {displayWeight && !product.variants?.length && <div><strong>Weight/Vol:</strong> {displayWeight}</div>}
                {displaySku && <div><strong>SKU:</strong> {displaySku}</div>}
              </div>

              {/* Highlights */}
              {product.highlights && product.highlights.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>Product Highlights</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#4b5563', lineHeight: 1.6 }}>
                    {product.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="detail-short-desc">
                {product.title?.toLowerCase().includes('curry') && product.title?.toLowerCase().includes('chilli')
                  ? curryChilliPowderShortDesc
                  : product.title?.toLowerCase().includes('red') && product.title?.toLowerCase().includes('chilli')
                    ? redChilliPowderShortDesc
                    : product.title?.toLowerCase().includes('turmeric')
                      ? turmericPowderShortDesc
                      : product.title?.toLowerCase().includes('honey')
                        ? rawHoneyShortDesc
                        : product.title?.toLowerCase().includes('salt')
                          ? mineralSaltShortDesc
                          : product.title?.toLowerCase().includes('powder') && product.title?.toLowerCase().includes('jaggery')
                            ? jaggeryPowderShortDesc
                            : product.title?.toLowerCase().includes('jaggery') 
                              ? jaggeryBlockShortDesc 
                              : product.title?.toLowerCase().includes('sugar')
                                ? naturalSugarShortDesc
                                : product.title?.toLowerCase().includes('ghee')
                                  ? gheeShortDesc
                                  : product.title?.toLowerCase().includes('sesame oil')
                                    ? sesameOilShortDesc
                                    : product.title?.toLowerCase().includes('coconut') && product.title?.toLowerCase().includes('oil')
                                      ? coconutOilShortDesc
                                      : product.title?.toLowerCase().includes('mustard') && product.title?.toLowerCase().includes('oil')
                                        ? mustardOilShortDesc
                                        : product.title?.toLowerCase().includes('groundnut') && product.title?.toLowerCase().includes('oil')
                                          ? groundnutOilShortDesc
                                          : product.title?.toLowerCase().includes('safflower') && product.title?.toLowerCase().includes('oil')
                                            ? safflowerOilShortDesc
                                            : (product.description || "Premium quality product sourced directly from our farms to your home.")}
              </p>

              <div className="detail-stock-status">
                {displayStock > 0 ? (
                  <>
                    <Check size={18} color="#2d7a5c" /> <span>In Stock & Ready to Ship</span>
                  </>
                ) : (
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Currently Out of Stock</span>
                )}
              </div>

              {/* Add to Cart Area */}
              {displayStock > 0 && (
                <div className="detail-action-area">
                  <div className="quantity-selector">
                    <button onClick={() => handleQuantityChange('decrement')}>-</button>
                    <input type="text" value={quantity} readOnly />
                    <button onClick={() => handleQuantityChange('increment')}>+</button>
                  </div>
                  <button 
                    className="btn-primary detail-add-btn" 
                    onClick={handleAddToCart}
                    style={{ backgroundColor: addedToCart ? '#2e7d32' : '' }}
                  >
                    <ShoppingBag size={20} /> 
                    {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                  </button>
                </div>
              )}


            </div>
          </div>
        </div>

        {/* Bottom Tabs */}
        <div className="detail-tabs-section mt-5">
          <div className="detail-tabs-nav">
            <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
          </div>
          
          <div className="detail-tab-content">
            {activeTab === 'description' && (
              <div className="tab-pane active fade-in">
                {product.title?.toLowerCase().includes('curry') && product.title?.toLowerCase().includes('chilli') ? curryChilliPowderLongDesc :
                 product.title?.toLowerCase().includes('red') && product.title?.toLowerCase().includes('chilli') ? redChilliPowderLongDesc :
                 product.title?.toLowerCase().includes('turmeric') ? turmericPowderLongDesc :
                 product.title?.toLowerCase().includes('honey') ? rawHoneyLongDesc :
                 product.title?.toLowerCase().includes('salt') ? mineralSaltLongDesc :
                 product.title?.toLowerCase().includes('powder') && product.title?.toLowerCase().includes('jaggery') ? jaggeryPowderLongDesc :
                 product.title?.toLowerCase().includes('jaggery') ? jaggeryBlockLongDesc : 
                 product.title?.toLowerCase().includes('sugar') ? naturalSugarLongDesc : 
                 product.title?.toLowerCase().includes('buffalo') && product.title?.toLowerCase().includes('ghee') ? buffaloGheeLongDesc : 
                 product.title?.toLowerCase().includes('ghee') ? gheeLongDesc : 
                 product.title?.toLowerCase().includes('sesame oil') ? sesameOilLongDesc : 
                 product.title?.toLowerCase().includes('coconut') && product.title?.toLowerCase().includes('oil') ? coconutOilLongDesc : 
                 product.title?.toLowerCase().includes('mustard') && product.title?.toLowerCase().includes('oil') ? mustardOilLongDesc : 
                 product.title?.toLowerCase().includes('groundnut') && product.title?.toLowerCase().includes('oil') ? groundnutOilLongDesc : 
                 product.title?.toLowerCase().includes('safflower') && product.title?.toLowerCase().includes('oil') ? safflowerOilLongDesc : (
                  <>
                    <p>{product.description}</p>
                    <p>Our commitment to purity and traditional practices ensures that every product reaching your kitchen is packed with natural nutrition and authentic flavor. All our ingredients are hand-picked, organically processed, and rigorously tested to meet our premium quality standards.</p>
                  </>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Related Products */}
        <div className="related-products-section" style={{ marginTop: '60px', borderTop: '1px solid #e5e7eb', paddingTop: '40px', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '30px' }}>You May Also Like</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} style={{ width: '100%', maxWidth: '280px' }}>
                <ProductCard product={relatedProduct} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
