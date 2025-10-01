"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Clock, Home } from "lucide-react";

function OrderPendingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center shadow-xl border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardHeader>
          <div className="mx-auto mb-4 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg">
            <Clock className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl text-yellow-700">
            Payment Pending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-slate-700">
            Your payment is being processed. We&apos;ll update your order status
            once confirmed.
          </p>

          {orderId && (
            <div className="bg-white/70 backdrop-blur p-4 rounded-xl border border-yellow-200">
              <p className="text-sm text-slate-600 mb-1">Order ID</p>
              <p className="font-mono font-semibold text-slate-900 break-all">
                {orderId}
              </p>
            </div>
          )}

          <div className="pt-2">
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
            <p>⏳ Please check your email for updates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-600 mx-auto" />
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderPendingContent />
    </Suspense>
  );
}
