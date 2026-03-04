"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Truck, Phone } from "lucide-react";

export default function CODConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-12 space-y-6">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />

          <div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Your order has been placed successfully.
            </p>
          </div>

          {orderNumber && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-bold">#{orderNumber}</p>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">
                  Cash on Delivery
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Please have the exact cash amount ready when your
                  order arrives.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-800">
                  We&apos;ll contact you
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Our team will call you to confirm delivery details
                  and schedule.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}