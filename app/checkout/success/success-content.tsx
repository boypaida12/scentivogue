"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(() => {
    return reference ? "loading" : "failed";
  });
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    if (!reference) {
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setOrderNumber(data.orderNumber);
          clearCart();
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [reference, clearCart]);

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="text-center py-12">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-gray-600">Please wait</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase. Your order has been received.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-bold">#{orderNumber}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              We&apos;ve sent a confirmation email with order details.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t process your payment. Please try again.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/cart">Back to Cart</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}