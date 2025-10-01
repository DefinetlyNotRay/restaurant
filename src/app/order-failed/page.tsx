"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { XCircle, Home, RotateCcw } from "lucide-react";

function OrderFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const statusMessage = searchParams.get("status_message");

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center shadow-xl border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
        <CardHeader>
          <div className="mx-auto mb-4 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg">
            <XCircle className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl text-red-700">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-slate-700">
            We're sorry, but your payment could not be processed. Please try
            again.
          </p>

          {statusMessage && (
            <div className="bg-red-100/70 backdrop-blur p-4 rounded-xl border border-red-200">
              <p className="text-sm text-red-700 font-medium">
                {statusMessage}
              </p>
            </div>
          )}

          {orderId && (
            <div className="bg-white/70 backdrop-blur p-4 rounded-xl border border-red-200">
              <p className="text-sm text-slate-600 mb-1">Order ID</p>
              <p className="font-mono font-semibold text-slate-900 break-all">
                {orderId}
              </p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link href="/checkout" className="block">
              <Button
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Menu
              </Button>
            </Link>
          </div>

          <div className="text-xs text-slate-600 pt-2">
            <p>If you continue to experience issues, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mx-auto" />
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderFailedContent />
    </Suspense>
  );
}
