import { NextResponse } from "next/server";

type CartItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
};

type InitializePaymentBody = {
  email: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  shipping: {
    address: string;
    city: string;
    region?: string;
  };
  items: CartItem[];
  paymentMethod: string;
  notes?: string;
  subtotal: number;
  shippingCost: number;
};

export async function POST(request: Request) {
  try {
    const body: InitializePaymentBody = await request.json();
    const {
      email,
      amount,
      customerName,
      customerPhone,
      shipping,
      items,
      paymentMethod,
      notes,
      subtotal,
      shippingCost,
    } = body;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    // Generate unique reference
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Convert amount to pesewas
    const amountInPesewas = Math.round(amount * 100);

    // Initialize Paystack with ALL order data in metadata
    // Order will ONLY be created after successful payment via webhook
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInPesewas,
          currency: "GHS",
          reference,
          callback_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
          metadata: {
            // Store all order data here
            // Webhook will use this to create the order
            customerName,
            customerPhone,
            shipping,
            items,
            paymentMethod,
            notes: notes || "",
            subtotal,
            shippingCost,
            total: amount,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack error:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Payment initialization failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(paystackData.data);
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}