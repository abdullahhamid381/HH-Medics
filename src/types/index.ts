export type ProductType =
  | "medicine"
  | "supplement"
  | "facewash"
  | "serum"
  | "cosmetic"
  | "general";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  brand: string | null;
  type: ProductType;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  stock: number;
  sku: string | null;
  unit: string | null;
  image: string | null;
  images: string | null;
  requires_prescription: number;
  rating: number;
  reviews_count: number;
  featured: number;
  status: "active" | "draft" | "archived";
  tags: string | null;
  created_at: string;
  updated_at: string;
  category_name?: string;
  category_slug?: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_method: "cod" | "card";
  payment_status: "unpaid" | "paid" | "refunded" | "partial_refund";
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  full_name: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  notes: string | null;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer_name?: string;
  customer_email?: string;
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "refunded";

export interface ReturnRequest {
  id: string;
  return_number: string;
  order_id: string;
  order_item_id: string;
  user_id: string;
  reason: string;
  comment: string | null;
  quantity: number;
  status: ReturnStatus;
  refund_amount: number;
  admin_note: string | null;
  created_at: string;
  resolved_at: string | null;
  order_number?: string;
  item_name?: string;
  item_image?: string;
  customer_name?: string;
}

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  stock: number;
  requiresPrescription: number;
  costPrice?: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  image: string | null;
  provider: string;
  role: "customer" | "admin";
  phone: string | null;
  created_at: string;
}
