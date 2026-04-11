export type Role = 'customer' | 'admin';

export interface MetaRecord {
  key: 'app';
  seedVersion: string;
  initializedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  password: string;
  role: Role;
  profileImageUrl: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
  createdAt: string;
}

export interface SessionRecord {
  key: 'current';
  userId: string;
  createdAt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: 'IDR';
  description: string;
  imageUrl: string;
  alt: string;
  category: string;
  featured: boolean;
  seller: string;
  rating: number;
  stock: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  availableMinPrice: number | null;
  availableMaxPrice: number | null;
}

export interface CartItem {
  id: string;
  ownerKey: string;
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  subtotal: number;
  total: number;
  itemCount: number;
  paymentMethod: 'cash';
  status: 'processing';
  shippingAddressLine1: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PendingRegistration {
  id: string;
  email: string;
  fullName: string;
  nickname: string;
  password: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
  profileImageUrl: string;
  createdAt: string;
  otp: string;
}

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  role: Role;
  profileImageUrl: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface CartProductItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  lineTotal: number;
}

export interface CartSnapshot {
  items: CartProductItem[];
  count: number;
  subtotal: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface RegisterPayload {
  fullName: string;
  nickname: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  addressLine1?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  profileImageUrl?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CheckoutPayload {
  mode: 'cart' | 'instant';
  productId?: string;
  quantity?: number;
  shippingAddress: {
    addressLine1: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export interface SessionResponse {
  user: SessionUser | null;
}
