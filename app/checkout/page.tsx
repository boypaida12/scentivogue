"use client";

import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CreditCard, LucideLock, Truck } from "lucide-react";
import StoreLayout from "@/components/store/store-layout";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

const COD_THRESHOLD = 200;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    paymentMethod: "momo",
    notes: "",
  });

  const shippingCost = total >= 200 ? 0 : 20;
  // const finalTotal = total + shippingCost;
  const finalTotal = total;
  const isCODAvailable = finalTotal < COD_THRESHOLD;
  const isCOD = formData.paymentMethod === "cod";

  // If COD is selected but order is now above threshold, reset payment method
  const handlePaymentMethodChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value });
  };

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const handleCODSubmit = async () => {
    try {
      const response = await fetch("/api/checkout/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
          shipping: {
            address: formData.address,
            city: formData.city,
            region: formData.region,
          },
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId, 
            quantity: item.quantity,
            price: item.price,
            name: item.name, 
          })),
          notes: formData.notes,
          subtotal: total,
          shippingCost,
          total: finalTotal,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to place order");
      }

      const data = await response.json();
      clearCart();

      // Redirect to COD confirmation page
      router.push(`/checkout/confirmation?orderNumber=${data.orderNumber}`);
    } catch (error) {
      console.error("COD error:", error);
      alert(error instanceof Error ? error.message : "Failed to place order");
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          amount: finalTotal,
          customerName: formData.name,
          customerPhone: formData.phone,
          shipping: {
            address: formData.address,
            city: formData.city,
            region: formData.region,
          },
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          subtotal: total,
          shippingCost,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize payment");
      }

      const paymentData = await response.json();
      window.location.href = paymentData.authorization_url;
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initialize payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (isCOD) {
      await handleCODSubmit();
    } else {
      await handleOnlinePayment();
    }
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/cart">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      placeholder="0244123456"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                        placeholder="Accra"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
                        placeholder="Greater Accra"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="payment">Select Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={handlePaymentMethodChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="momo">
                          📱 Mobile Money (MTN, Vodafone, AirtelTigo)
                        </SelectItem>
                        <SelectItem value="card">
                          💳 Bank Card (Visa, Mastercard)
                        </SelectItem>
                        {isCODAvailable && (
                          <SelectItem value="cod">
                            🤝 Cash on Delivery
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment method info */}
                  {isCOD ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-amber-700 mt-1">
                            Pay GH₵ {finalTotal.toFixed(2)} in cash when your
                            order arrives. Please have the exact amount ready.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">
                            Secure Online Payment
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            You will be redirected to Paystack to complete your
                            payment securely.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COD not available message */}
                  {!isCODAvailable && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        💡 Cash on Delivery is only available for orders under
                        GH₵ {COD_THRESHOLD.toFixed(2)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any special instructions for your order..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        <div className="relative w-16 h-16 bg-gray-100 rounded shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-gray-600">
                            GH₵ {item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          GH₵ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>GH₵ {total.toFixed(2)}</span>
                    </div>
                    {/* <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">
                            FREE
                          </span>
                        ) : (
                          `GH₵ ${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {total < 200 && (
                      <p className="text-xs text-gray-500">
                        Add GH₵ {(200 - total).toFixed(2)} more for free
                        delivery within Accra
                      </p>
                    )} */}
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>GH₵ {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-black rounded-none"
                    disabled={isProcessing}
                  >
                    {isCOD ? (
                      <>
                        <Truck className="h-5 w-5 mr-2" />
                        {isProcessing ? "Placing Order..." : "Place Order"}
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        {isProcessing ? "Processing..." : "Proceed to Payment"}
                      </>
                    )}
                  </Button>

                  {!isCOD && (
                    <div className="flex items-center gap-1 w-fit mx-auto">
                      <LucideLock size={10} className="text-gray-500" />
                      <p className="text-sm text-gray-500 text-center">
                        Secured by Paystack
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </StoreLayout>
  );
}
