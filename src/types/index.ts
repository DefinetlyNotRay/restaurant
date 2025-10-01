export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  status: "pending" | "paid" | "processing" | "completed" | "cancelled";
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface PaymentResponse {
  token?: string;
  redirect_url?: string;
  payment_url?: string;
}

export interface AIExtractionResult {
  name: string;
  description: string;
  price: number;
}
