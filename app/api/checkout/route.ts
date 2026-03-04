import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

type CheckoutBody = {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    region?: string;
  };
  items: OrderItem[];
  paymentMethod: string;
  notes?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json();
    const { customer, shipping, items, paymentMethod, notes, subtotal, shippingCost, total } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Create or get customer
    let customerRecord = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (!customerRecord) {
      customerRecord = await prisma.customer.create({
        data: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        },
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerRecord.id,
        shippingName: customer.name,
        shippingEmail: customer.email,
        shippingPhone: customer.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingRegion: shipping.region || null,
        subtotal,
        shippingCost,
        total,
        paymentMethod,
        paymentStatus: "PENDING",
        status: "PENDING",
        notes: notes || null,
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}