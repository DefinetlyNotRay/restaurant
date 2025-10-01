"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { CartManager } from "@/lib/cart";
import toast from "react-hot-toast";
import { UtensilsCrossed } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data);
      } catch {
        toast.error("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product, quantity: number) => {
    CartManager.addToCart(product, quantity);
    // Notify listeners in this tab
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg mb-4">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-3">
            Our Menu
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Fresh, delicious food delivered to your door. Browse our curated
            selection and add your favorites to the cart.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto" />
            <p className="mt-4 text-slate-600">Loading menu...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur rounded-3xl border border-orange-100 shadow-sm">
            <UtensilsCrossed className="h-16 w-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No menu items yet
            </h3>
            <p className="text-slate-600">
              Check back soon for delicious options!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
