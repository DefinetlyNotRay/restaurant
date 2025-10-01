import { CartItem, Product } from "@/types";

export class CartManager {
  private static STORAGE_KEY = "restaurant-cart";

  static getCart(): CartItem[] {
    if (typeof window === "undefined") return [];

    try {
      const cart = localStorage.getItem(this.STORAGE_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  }

  static addToCart(product: Product, quantity: number = 1): CartItem[] {
    const cart = this.getCart();
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    this.saveCart(cart);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return cart;
  }

  static removeFromCart(productId: string): CartItem[] {
    const cart = this.getCart().filter((item) => item.id !== productId);
    this.saveCart(cart);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return cart;
  }

  static updateQuantity(productId: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    const item = cart.find((item) => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      item.quantity = quantity;
    }

    this.saveCart(cart);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cartUpdated"));
    }
    return cart;
  }

  static clearCart(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  static getCartTotal(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  static getCartItemCount(cart: CartItem[]): number {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }

  private static saveCart(cart: CartItem[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    }
  }
}
