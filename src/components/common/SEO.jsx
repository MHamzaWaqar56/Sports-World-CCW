import { useEffect } from 'react';
import { toAbsoluteUrl } from '../../utils/seo';

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    element.dataset.seoManaged = 'true';
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });

  element.dataset.seoManaged = 'true';
  return element;
};

const SEO = ({
  title,
  description,
  keywords = [],
  canonicalPath = '/',
  noIndex = false,
  structuredData = [],
}) => {
  useEffect(() => {
    const pageTitle = title || 'Sports World Chichawatni';
    const pageDescription = description || 'Sports World Chichawatni is a wholesale and retail sports store in Chichawatni, Punjab.';
    const canonicalUrl = toAbsoluteUrl(canonicalPath);

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: 'description', content: pageDescription });

    if (keywords.length > 0) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') });
    }

    upsertMeta('meta[name="robots"]', { name: 'robots', content: noIndex ? 'noindex, nofollow' : 'index, follow' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: pageDescription });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: pageDescription });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.dataset.seoManaged = 'true';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    canonical.dataset.seoManaged = 'true';

    document.head.querySelectorAll('script[type="application/ld+json"][data-seo-managed="true"]').forEach((node) => node.remove());
    structuredData.filter(Boolean).forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seoManaged = 'true';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.head.querySelectorAll('[data-seo-managed="true"]').forEach((node) => node.remove());
    };
  }, [canonicalPath, description, keywords, noIndex, structuredData, title]);

  return null;
};

export default SEO;