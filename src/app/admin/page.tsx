"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminRoute } from "@/components/AdminRoute";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatPrice, formatDate } from "@/lib/utils";
import { Plus, Upload, Eye, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        toast.success("Product deleted successfully");
      } else {
        toast.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your restaurant menu and products
              </p>
            </div>

            <Link href="/admin/upload">
              <Button className="flex items-center gap-2 shadow-lg">
                <Upload className="h-4 w-4" />
                Upload Product
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Total Products
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {products.length}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl shadow-md">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Average Price
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {products.length > 0
                        ? formatPrice(
                            products.reduce((sum, p) => sum + p.price, 0) /
                              products.length
                          )
                        : "$0.00"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-md">
                    <Eye className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Latest Product
                    </p>
                    <p className="text-sm font-bold text-slate-900 line-clamp-2">
                      {products.length > 0
                        ? products[0]?.name || "No products"
                        : "No products"}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl shadow-md">
                    <Upload className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl mb-4">
                    <Upload className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No products yet
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Start by uploading your first product with AI-powered
                    extraction
                  </p>
                  <Link href="/admin/upload">
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-orange-100">
                        <th className="text-left py-4 px-4 font-semibold text-slate-900">
                          Product
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-900">
                          Price
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-900">
                          Created
                        </th>
                        <th className="text-right py-4 px-4 font-semibold text-slate-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-4">
                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-amber-50">
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {product.name}
                                </p>
                                <p className="text-sm text-slate-600 line-clamp-1">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-slate-900">
                              {formatPrice(product.price)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">
                            {product.created_at
                              ? formatDate(product.created_at)
                              : "Unknown"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/products/${product.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors border-2 border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
