import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type WebhookItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number;
  name: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "No reference provided" },
        { status: 400 }
      );
    }

    // First check if webhook already created the order
    const existingOrder = await prisma.order.findFirst({
      where: { paymentReference: reference },
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        orderNumber: existingOrder.orderNumber,
        source: "webhook",
      });
    }

    // Webhook might be delayed - verify directly with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    console.log(
      "Paystack verify response:",
      JSON.stringify(paystackData.data?.metadata, null, 2)
    );

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ success: false });
    }

    const { metadata, customer: paystackCustomer } = paystackData.data;
    const email = paystackCustomer.email;

    const { customerName, customerPhone, shipping, items, paymentMethod, notes } =
      metadata;

    // Parse numbers explicitly - Paystack metadata returns strings
    const subtotal = parseFloat(metadata.subtotal);
    const shippingCost = parseFloat(metadata.shippingCost);
    const total = parseFloat(metadata.total);

    // Create or get customer
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          name: customerName,
          phone: customerPhone,
        },
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order with variant support
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        shippingName: customerName,
        shippingEmail: email,
        shippingPhone: customerPhone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingRegion: shipping.region || null,
        subtotal,
        shippingCost,
        total,
        paymentMethod,
        paymentStatus: "PAID",
        paymentReference: reference,
        paidAt: new Date(),
        status: "PROCESSING",
        notes: notes || null,
        items: {
          create: (items as WebhookItem[]).map((item) => ({
            productId: item.variantId ? null : item.productId,  // ✅ null if variant
            variantId: item.variantId || null,                  // ✅ Save variantId
            quantity: parseInt(String(item.quantity)),
            price: parseFloat(String(item.price)),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,  // ✅ Include variant
          },
        },
      },
    });

    // Reduce stock (handle both products and variants)
    for (const item of items as WebhookItem[]) {
      if (item.variantId) {
        // Reduce variant stock
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: parseInt(String(item.quantity)),
            },
          },
        });
      } else {
        // Reduce product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: parseInt(String(item.quantity)),
            },
          },
        });
      }
    }

    console.log("✅ Order created via fallback verify:", newOrder.orderNumber);

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      source: "fallback",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}