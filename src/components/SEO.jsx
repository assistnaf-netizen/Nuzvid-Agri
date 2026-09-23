import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image = 'https://www.nuzvidagrifarms.com/cdn/shop/files/new_1920x.jpg?v=1759635977', 
  url = window.location.href, 
  type = 'website', 
  productSchema = null 
}) => {
  const defaultTitle = 'Nuzvid Agri Farms - Pure Wood-Pressed Oils & Organic Food';
  const pageTitle = title ? `${title} | Nuzvid Agri Farms` : defaultTitle;
  const pageDesc = description || 'Welcome to Nuzvid Agri Farms. Pure wood-pressed oils, A2 Ghee, and organic groceries from our farm to your table.';

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={url.split('?')[0]} />

      {/* Open Graph (Facebook / LinkedIn) */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Schema Markup */}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
