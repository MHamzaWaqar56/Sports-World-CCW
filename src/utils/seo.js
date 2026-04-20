const SITE_URL = 'https://sports-world-ccw.vercel.app';

const businessInfo = {
  name: 'Sports World Chichawatni',
  websiteUrl: SITE_URL,
  type: 'Wholesale & Retail Ecommerce Sports Store',
  description:
    'Sports World Chichawatni is a leading wholesale and retail sports store in Chichawatni, Punjab, offering cricket bats, footballs, hockey sticks, footwear, sleeves, tennis equipment, basketballs, kabaddi gear, and sports accessories.',
  address: {
    streetAddress: 'College Road, Chichawatni, District Sahiwal, Punjab, Pakistan',
    addressLocality: 'Chichawatni',
    addressRegion: 'Punjab',
    postalCode: '57200',
    addressCountry: 'Pakistan',
  },
  phone: '+92 322 4841625',
  whatsapp: '+92 322 4841625',
  email: 'sportsworldccw@gmail.com',
  mapsUrl: 'https://maps.app.goo.gl/XDzWCH3FHdHxHwfu8',
  hours: 'Monday to Sunday: 8:00 AM – 10:00 PM',
  socialLinks: {
    facebook: 'https://facebook.com/people/sports-world/61567867692253',
    tiktok: 'https://www.tiktok.com/@sports.word.chich',
    whatsapp: 'https://wa.me/923224841625',
  },
  keywords: [
    'Sports World',
    'Sports World Chichawatni',
    'Sports World CCW',
    'Sports World Shop',
    'Sports Store Chichawatni',
    'Buy Sports Equipment Pakistan',
    'Wholesale Sports Sahiwal',
    'Cricket Equipment Chichawatni',
    'Football Shop Pakistan',
    'Sports Accessories Online',
  ],
  topCategories: [
    'Cricket',
    'Football',
    'Hockey',
    'Tennis',
    'Footwear',
    'Sleeves',
    'Basketball',
    'Kabaddi',
    'Indoor Games',
    'Outdoor Games',
    'Sports Accessories',
  ],
};

const toAbsoluteUrl = (path = '/') => {
  if (!path) return SITE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SportingGoodsStore',
  name: businessInfo.name,
  url: businessInfo.websiteUrl,
  description: businessInfo.description,
  telephone: businessInfo.phone,
  email: businessInfo.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: businessInfo.address.streetAddress,
    addressLocality: businessInfo.address.addressLocality,
    addressRegion: businessInfo.address.addressRegion,
    postalCode: businessInfo.address.postalCode,
    addressCountry: businessInfo.address.addressCountry,
  },
  openingHours: [businessInfo.hours],
  sameAs: [businessInfo.socialLinks.facebook, businessInfo.socialLinks.tiktok],
});

const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: businessInfo.name,
  url: businessInfo.websiteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${businessInfo.websiteUrl}/shop?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

const localBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SportingGoodsStore',
  name: businessInfo.name,
  url: businessInfo.websiteUrl,
  telephone: businessInfo.phone,
  priceRange: 'PKR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: businessInfo.address.streetAddress,
    addressLocality: businessInfo.address.addressLocality,
    addressRegion: businessInfo.address.addressRegion,
    postalCode: businessInfo.address.postalCode,
    addressCountry: businessInfo.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 30.528267,
    longitude: 72.68056,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '22:00',
    },
  ],
  sameAs: [businessInfo.socialLinks.facebook, businessInfo.socialLinks.tiktok],
});

const faqSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
});

const productSchema = (product) => {
  if (!product) return null;

  const price = Number(product?.price || product?.sellingPrice || product?.salePrice || 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || businessInfo.description,
    brand: {
      '@type': 'Brand',
      name: product.brand || businessInfo.name,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: String(Number.isFinite(price) ? price : 0),
      availability: product.countInStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${businessInfo.websiteUrl}/product/${product._id}`,
    },
  };
};

export {
  SITE_URL,
  businessInfo,
  toAbsoluteUrl,
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  faqSchema,
  productSchema,
};