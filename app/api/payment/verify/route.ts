import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaidOrder } from "@/lib/create-paid-order";

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
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ success: false });
    }

    const { order, created } = await createPaidOrder(paystackData.data);

    if (created) {
      console.log("✅ Order created via fallback verify:", order.orderNumber);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      source: created ? "fallback" : "webhook",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
