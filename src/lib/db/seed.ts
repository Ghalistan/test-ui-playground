import type { Product, User } from '../types';

export const SEED_VERSION = '2026-04-11-shopedia-v3';

export const seedProducts: Product[] = [
  {
    id: 'p-skyline-brew-kettle',
    slug: 'skyline-brew-kettle',
    name: 'Skyline Brew Kettle',
    price: 1249000,
    currency: 'IDR',
    description:
      'A quick-boil kettle with a precise pour spout and compact countertop footprint.',
    imageUrl: '/images/products/skyline-brew-kettle.svg',
    alt: 'Minimalist electric kettle in a warm orange finish.',
    category: 'Home Kitchen',
    featured: true,
    seller: 'Northwind Home',
    rating: 4.8,
    stock: 14,
  },
  {
    id: 'p-nimbus-wireless-headphones',
    slug: 'nimbus-wireless-headphones',
    name: 'Nimbus Wireless Headphones',
    price: 2399000,
    currency: 'IDR',
    description:
      'Soft-cushion headphones tuned for daily focus sessions and long travel days.',
    imageUrl: '/images/products/nimbus-wireless-headphones.svg',
    alt: 'Over-ear wireless headphones on a green backdrop.',
    category: 'Audio',
    featured: true,
    seller: 'Signal Studio',
    rating: 4.7,
    stock: 9,
  },
  {
    id: 'p-pulsefit-smart-band',
    slug: 'pulsefit-smart-band',
    name: 'PulseFit Smart Band',
    price: 1099000,
    currency: 'IDR',
    description:
      'A lightweight activity band with sleep tracking, heart rate monitoring, and seven-day battery life.',
    imageUrl: '/images/products/pulsefit-smart-band.svg',
    alt: 'Slim fitness tracker with a bright display.',
    category: 'Wearables',
    featured: true,
    seller: 'Core Motion',
    rating: 4.5,
    stock: 22,
  },
  {
    id: 'p-novablend-portable-blender',
    slug: 'novablend-portable-blender',
    name: 'NovaBlend Portable Blender',
    price: 899000,
    currency: 'IDR',
    description:
      'USB-C rechargeable personal blender sized for smoothies, shakes, and small kitchen setups.',
    imageUrl: '/images/products/novablend-portable-blender.svg',
    alt: 'Portable blender bottle with a clear chamber.',
    category: 'Home Kitchen',
    featured: false,
    seller: 'Morning Pantry',
    rating: 4.4,
    stock: 18,
  },
  {
    id: 'p-loom-mini-desk-lamp',
    slug: 'loom-mini-desk-lamp',
    name: 'Loom Mini Desk Lamp',
    price: 749000,
    currency: 'IDR',
    description:
      'A compact desk lamp with warm-to-cool light presets for focus work and reading corners.',
    imageUrl: '/images/products/loom-mini-desk-lamp.svg',
    alt: 'Modern desk lamp with a rounded head.',
    category: 'Workspace',
    featured: false,
    seller: 'Oak & Orbit',
    rating: 4.6,
    stock: 11,
  },
  {
    id: 'p-cloudrest-neck-pillow',
    slug: 'cloudrest-neck-pillow',
    name: 'CloudRest Neck Pillow',
    price: 459000,
    currency: 'IDR',
    description:
      'A supportive memory foam travel pillow with a washable cover and quick-pack loop.',
    imageUrl: '/images/products/cloudrest-neck-pillow.svg',
    alt: 'Travel neck pillow with a deep navy finish.',
    category: 'Travel',
    featured: false,
    seller: 'Wayfare Goods',
    rating: 4.3,
    stock: 27,
  },
  {
    id: 'p-aerocarry-weekender-bag',
    slug: 'aerocarry-weekender-bag',
    name: 'AeroCarry Weekender Bag',
    price: 1699000,
    currency: 'IDR',
    description:
      'A weather-resistant duffel with shoe compartment, laptop sleeve, and overnight-ready capacity.',
    imageUrl: '/images/products/aerocarry-weekender-bag.svg',
    alt: 'Structured weekender bag in blue and cream tones.',
    category: 'Travel',
    featured: false,
    seller: 'Field Route',
    rating: 4.8,
    stock: 8,
  },
  {
    id: 'p-harbor-ceramic-tumbler',
    slug: 'harbor-ceramic-tumbler',
    name: 'Harbor Ceramic Tumbler',
    price: 329000,
    currency: 'IDR',
    description:
      'A double-wall tumbler that keeps coffee warm while staying comfortable to hold.',
    imageUrl: '/images/products/harbor-ceramic-tumbler.svg',
    alt: 'Ceramic tumbler with a cream body and mint lid.',
    category: 'Home Kitchen',
    featured: false,
    seller: 'Harbor Table',
    rating: 4.2,
    stock: 32,
  },
  {
    id: 'p-mistline-aroma-diffuser',
    slug: 'mistline-aroma-diffuser',
    name: 'Mistline Aroma Diffuser',
    price: 879000,
    currency: 'IDR',
    description:
      'A quiet ceramic diffuser with soft ambient light modes for bedside tables and calm work corners.',
    imageUrl: '/images/products/mistline-aroma-diffuser.svg',
    alt: 'Ceramic aroma diffuser with a soft blue glow.',
    category: 'Home Living',
    featured: false,
    seller: 'Still Form',
    rating: 4.6,
    stock: 16,
  },
  {
    id: 'p-glowdock-wireless-charger',
    slug: 'glowdock-wireless-charger',
    name: 'GlowDock Wireless Charger',
    price: 699000,
    currency: 'IDR',
    description:
      'A slim magnetic charging stand that lifts your phone upright for desks, nightstands, and quick glances.',
    imageUrl: '/images/products/glowdock-wireless-charger.svg',
    alt: 'Wireless phone charging stand with a glowing charging ring.',
    category: 'Workspace',
    featured: false,
    seller: 'Current Supply',
    rating: 4.5,
    stock: 24,
  },
  {
    id: 'p-trailsip-insulated-bottle',
    slug: 'trailsip-insulated-bottle',
    name: 'TrailSip Insulated Bottle',
    price: 389000,
    currency: 'IDR',
    description:
      'A stainless steel bottle with a textured grip sleeve that keeps drinks cold through commutes and day trips.',
    imageUrl: '/images/products/trailsip-insulated-bottle.svg',
    alt: 'Insulated water bottle with a coral cap and cream body.',
    category: 'Travel',
    featured: false,
    seller: 'Pine Relay',
    rating: 4.7,
    stock: 28,
  },
  {
    id: 'p-orbit-note-stand',
    slug: 'orbit-note-stand',
    name: 'Orbit Note Stand',
    price: 499000,
    currency: 'IDR',
    description:
      'A folding aluminum stand for tablets, recipe cards, and notebooks with a compact footprint for small desks.',
    imageUrl: '/images/products/orbit-note-stand.svg',
    alt: 'Minimal desk stand holding an open notebook.',
    category: 'Workspace',
    featured: false,
    seller: 'Frame & Form',
    rating: 4.4,
    stock: 20,
  },
  {
    id: 'p-sunmesh-beach-speaker',
    slug: 'sunmesh-beach-speaker',
    name: 'SunMesh Beach Speaker',
    price: 1449000,
    currency: 'IDR',
    description:
      'A splash-resistant portable speaker with woven texture, punchy sound, and a strap for easy carry.',
    imageUrl: '/images/products/sunmesh-beach-speaker.svg',
    alt: 'Portable speaker with a woven body and carrying strap.',
    category: 'Audio',
    featured: false,
    seller: 'Tidal Tone',
    rating: 4.6,
    stock: 13,
  },
  {
    id: 'p-cinder-panini-press',
    slug: 'cinder-panini-press',
    name: 'Cinder Panini Press',
    price: 1849000,
    currency: 'IDR',
    description:
      'A compact grill press with floating hinges and easy-clean plates for toasties, wraps, and weekend brunches.',
    imageUrl: '/images/products/cinder-panini-press.svg',
    alt: 'Compact panini press in a warm red finish.',
    category: 'Home Kitchen',
    featured: false,
    seller: 'Hearth Lane',
    rating: 4.7,
    stock: 10,
  },
  {
    id: 'p-lumen-clip-reading-light',
    slug: 'lumen-clip-reading-light',
    name: 'Lumen Clip Reading Light',
    price: 299000,
    currency: 'IDR',
    description:
      'A rechargeable reading light with a padded clip, warm dimming steps, and a flexible neck for travel.',
    imageUrl: '/images/products/lumen-clip-reading-light.svg',
    alt: 'Clip-on reading light with a flexible neck and soft glow.',
    category: 'Workspace',
    featured: false,
    seller: 'North Arc',
    rating: 4.3,
    stock: 34,
  },
  {
    id: 'p-drifter-crossbody-pack',
    slug: 'drifter-crossbody-pack',
    name: 'Drifter Crossbody Pack',
    price: 949000,
    currency: 'IDR',
    description:
      'A lightweight sling bag with quick-access pockets for passports, cables, and everyday grab-and-go carry.',
    imageUrl: '/images/products/drifter-crossbody-pack.svg',
    alt: 'Crossbody sling bag with a curved silhouette.',
    category: 'Travel',
    featured: false,
    seller: 'Roam Dept.',
    rating: 4.5,
    stock: 19,
  },
];

export const seedCustomer: User = {
  id: 'user-seed-customer',
  firstName: 'Mira',
  lastName: 'Tan',
  nickname: 'mira',
  email: 'customer@gghgh.dev',
  password: 'password123',
  role: 'customer',
  profileImageUrl: '/images/avatars/default-avatar.svg',
  addressLine1: '221B Market Street',
  city: 'Singapore',
  country: 'Singapore',
  postalCode: '059413',
  createdAt: '2026-04-10T18:57:00.000Z',
};

export function matchesProductSearch(product: Product, query: string) {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [product.name, product.seller].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

export function filterSeedProducts(query: string) {
  return seedProducts.filter((product) => matchesProductSearch(product, query));
}

export function getSeedProductBySlug(slug: string) {
  return seedProducts.find((product) => product.slug === slug) ?? null;
}
