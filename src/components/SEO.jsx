import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://www.nuzvidagrifarms.com';

const SEO = ({ 
  title, 
  description, 
  keywords,
  image = `${BASE_URL}/favicon-512x512.png`, 
  url, 
  type = 'website', 
  productSchema = null,
  schema = null,
  breadcrumbs = null,
  noindex = false
}) => {
  const defaultTitle = 'Nuzvid Agri Farms | Pure Wood-Pressed Oils, A2 Desi Cow Ghee & Organic Groceries';
  const pageTitle = title ? (title.includes('Nuzvid Agri Farms') ? title : `${title} | Nuzvid Agri Farms`) : defaultTitle;
  const pageDesc = description || 'Shop authentic cold & wood-pressed oils (Groundnut, Sesame, Coconut), Vedic Bilona A2 Desi Cow Ghee, raw forest honey, and organic farm groceries directly from Nuzvid Agri Farms, Andhra Pradesh.';
  const pageKeywords = keywords || 'Nuzvid Agri Farms, wood pressed oils, cold pressed oil, A2 cow ghee, bilona ghee, pure desi ghee, raw forest honey, organic jaggery powder, natural sweeteners, stone ground spices, organic farm food, Andhra Pradesh';

  // Ensure absolute canonical URL
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const canonicalUrl = url ? url.split('?')[0] : `${BASE_URL}${currentPath}`.replace(/\/$/, '') || BASE_URL;

  // Build BreadcrumbList Schema if provided
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': crumb.name,
      'item': crumb.path.startsWith('http') ? crumb.path : `${BASE_URL}${crumb.path}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph (Facebook / LinkedIn) */}
      <meta property="og:site_name" content="Nuzvid Agri Farms" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={image} />

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Custom Schema / Product Schema */}
      {(schema || productSchema) && (
        <script type="application/ld+json">
          {JSON.stringify(schema || productSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
