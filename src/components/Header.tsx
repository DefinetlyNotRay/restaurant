"use client";

import Link from "next/link";
import { ShoppingCart, LogIn, LogOut, UserCircle, Shield } from "lucide-react";
import { CartManager } from "@/lib/cart";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export function Header() {
  const { user, logout, loading } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const items = CartManager.getCart();
      const count = CartManager.getCartItemCount(items);
      setItemCount(count);
    };

    updateCartCount();

    // Listen for storage events to update cart count when cart changes
    window.addEventListener("storage", updateCartCount);

    // Custom event for same-tab cart updates
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Delicious Bites
            </h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-700 hover:text-orange-600 transition-colors font-medium"
            >
              Menu
            </Link>

            {/* Show admin link only for admin users */}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-slate-700 hover:text-orange-600 transition-colors font-medium"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}

            {/* Cart link - only show for logged in customers */}
            {user?.role === "customer" && (
              <Link
                href="/cart"
                className="relative text-slate-700 hover:text-orange-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-slate-700">
                        {user.name || user.email}
                      </span>
                      {user.role === "admin" && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                          Admin
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center gap-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
