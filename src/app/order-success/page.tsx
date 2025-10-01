"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CheckCircle, Home } from "lucide-react";
import { CartManager } from "@/lib/cart";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    CartManager.clearCart();
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center shadow-xl border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <div className="mx-auto mb-4 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl text-green-700">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-slate-700">
            Thank you for your order! Your payment has been confirmed.
          </p>

          {orderId && (
            <div className="bg-white/70 backdrop-blur p-4 rounded-xl border border-green-200">
              <p className="text-sm text-slate-600 mb-1">Order ID</p>
              <p className="font-mono font-semibold text-slate-900 break-all">
                {orderId}
              </p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link href="/" className="block">
              <Button
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                <Home className="h-4 w-4" />
                Back to Menu
              </Button>
            </Link>
          </div>

          <div className="text-sm text-slate-600 pt-2">
            <p>✓ Confirmation email sent</p>
            <p>✓ Your order is being prepared</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto" />
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
