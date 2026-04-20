const normalizeId = (value) => String(value ?? '').trim();

export const isVariableProduct = (product) =>
  String(product?.productType || '').toLowerCase() === 'variable' &&
  Array.isArray(product?.variants) &&
  product.variants.length > 0;

export const getProductVariants = (product) =>
  isVariableProduct(product) ? product.variants : [];

export const getVariantById = (product, variantId) => {
  const normalizedVariantId = normalizeId(variantId);
  if (!normalizedVariantId) return null;
  return getProductVariants(product).find(
    (variant) => normalizeId(variant?._id) === normalizedVariantId
  ) || null;
};

export const getPreferredVariant = (product, variantId = '') => {
  const matched = getVariantById(product, variantId);
  if (matched) return matched;

  const variants = getProductVariants(product);
  if (!variants.length) return null;

  const inStock = variants.find((variant) => Number(variant?.countInStock || 0) > 0);
  return inStock || variants[0] || null;
};

export const getDisplayPrice = (product, selectedVariant = null) => {
  if (selectedVariant && Number.isFinite(Number(selectedVariant.price))) {
    return Number(selectedVariant.price);
  }

  if (isVariableProduct(product)) {
    const variants = getProductVariants(product);
    const prices = variants
      .map((variant) => Number(variant?.price))
      .filter((price) => Number.isFinite(price) && price >= 0);

    if (prices.length) {
      return Math.min(...prices);
    }
  }

  return Number(product?.price || 0);
};

export const getDisplayStock = (product, selectedVariant = null) => {
  if (selectedVariant && Number.isFinite(Number(selectedVariant.countInStock))) {
    return Number(selectedVariant.countInStock);
  }

  if (isVariableProduct(product)) {
    return getProductVariants(product).reduce(
      (sum, variant) => sum + Math.max(Number(variant?.countInStock || 0), 0),
      0
    );
  }

  return Number(product?.countInStock || 0);
};

export const getVariantLabel = (variant) => {
  if (!variant) return '';
  const attributes = Array.isArray(variant.attributes) ? variant.attributes : [];
  const formattedAttributes = attributes
    .map((attribute) => {
      const key = String(attribute?.key || '').trim();
      const value = String(attribute?.value || '').trim();
      if (!key && !value) return '';
      if (!key) return value;
      if (!value) return key;
      return `${key}: ${value}`;
    })
    .filter(Boolean)
    .join(' | ');

  return variant.name || formattedAttributes || variant.sku || '';
};

export const buildVariantPayload = (variant) => {
  if (!variant || !variant._id) return {};

  const attributes = Array.isArray(variant.attributes)
    ? variant.attributes
        .map((attribute) => ({
          key: String(attribute?.key || '').trim(),
          value: String(attribute?.value || '').trim(),
        }))
        .filter((attribute) => attribute.key || attribute.value)
    : [];

  return {
    variantId: normalizeId(variant._id),
    variantName: String(variant.name || '').trim(),
    variantSku: String(variant.sku || '').trim(),
    variantPrice: Number(variant.price || 0),
    variantImage: String(variant.image || '').trim(),
    variantAttributes: attributes,
  };
};

export const getCartItemVariant = (cartItem) => {
  const product = cartItem?.product;
  if (!product) return null;

  const byId = getVariantById(product, cartItem?.variantId);
  if (byId) return byId;

  const sku = String(cartItem?.variantSku || '').trim().toLowerCase();
  const name = String(cartItem?.variantName || '').trim().toLowerCase();
  const variants = getProductVariants(product);

  if (sku) {
    const bySku = variants.find(
      (variant) => String(variant?.sku || '').trim().toLowerCase() === sku
    );
    if (bySku) return bySku;
  }

  if (name) {
    const byName = variants.find(
      (variant) => String(variant?.name || '').trim().toLowerCase() === name
    );
    if (byName) return byName;
  }

  return null;
};

export const getCartItemUnitPrice = (cartItem) => {
  const variantPrice = Number(cartItem?.variantPrice);
  if (Number.isFinite(variantPrice) && variantPrice > 0) {
    return variantPrice;
  }

  const matchedVariant = getCartItemVariant(cartItem);
  if (matchedVariant) {
    return Number(matchedVariant.price || 0);
  }

  return Number(cartItem?.product?.price || 0);
};

export const getCartItemStock = (cartItem) => {
  const matchedVariant = getCartItemVariant(cartItem);
  if (matchedVariant) {
    return Number(matchedVariant.countInStock || 0);
  }

  return Number(cartItem?.product?.countInStock || 0);
};
