"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    // Require login for customers to add to cart
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    if (user.role !== "customer") {
      toast.error("Only customers can add items to cart");
      return;
    }

    setIsAdding(true);
    try {
      onAddToCart(product, quantity);
      toast.success(`Added ${quantity} ${product.name} to cart`);
      setQuantity(1);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-100/50">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-center gap-3 py-2">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="w-8 h-8 rounded-lg border-2 border-orange-200 text-orange-600 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="font-semibold text-lg min-w-[2rem] text-center text-slate-800">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            className="w-8 h-8 rounded-lg border-2 border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isAdding ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add {formatPrice(product.price * quantity)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
