import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ UPDATED: Include bundleItemsSelected
type CODItem = {
  productId: string;
  variantId?: string | null;
  bundleItemsSelected?: string[]; // ✅ ADD THIS
  quantity: number;
  price: number;
  name: string;
};

type CODBody = {
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
  items: CODItem[];
  notes?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const body: CODBody = await request.json();
    const {
      customer,
      shipping,
      items,
      notes,
      subtotal,
      shippingCost,
      total,
    } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    // Validate COD threshold
    if (total >= 200) {
      return NextResponse.json(
        { error: "Cash on Delivery is only available for orders under GH₵ 200" },
        { status: 400 }
      );
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

    // Create COD order immediately
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
        paymentMethod: "cod",
        paymentStatus: "PENDING",
        status: "PENDING",
        notes: notes || null,
        items: {
          create: items.map((item) => {
            const orderItemData = {
              productId: item.variantId ? null : item.productId,
              variantId: item.variantId || null,
              // ✅ ADD THIS: Save bundle items as JSON string
              bundleItemsSelected: item.bundleItemsSelected
                ? JSON.stringify(item.bundleItemsSelected)
                : null,
              quantity: parseInt(String(item.quantity)),
              productName: item.name || "Unknown Product",
              price: parseFloat(String(item.price)),
            };

            console.log("  📦 Creating OrderItem:", orderItemData);
            return orderItemData;
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // ✅ UPDATED: Handle stock reduction for bundles, variants, and simple products
    for (const item of items) {
      if (item.bundleItemsSelected && item.bundleItemsSelected.length > 0) {
        // For bundles: reduce stock of selected bundle items
        for (const bundleItemId of item.bundleItemsSelected) {
          await prisma.bundleItem.update({
            where: { id: bundleItemId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
        console.log(
          `  ✅ Reduced stock for ${item.bundleItemsSelected.length} bundle items by ${item.quantity}`
        );
      } else if (item.variantId) {
        // For variants: reduce variant stock
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
        console.log(
          `  ✅ Reduced variant ${item.variantId} stock by ${item.quantity}`
        );
      } else {
        // For simple products: reduce product stock
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
        console.log(
          `  ✅ Reduced product ${item.productId} stock by ${item.quantity}`
        );
      }
    }

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        orderId: order.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("COD checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}