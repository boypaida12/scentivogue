import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { paymentStatus } = body;

    // Validate using Prisma enum values
    const validStatuses = Object.values(PaymentStatus);
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Build update data with proper Prisma enum types
    const updateData: {
      paymentStatus: PaymentStatus;
      paidAt?: Date;
      status?: OrderStatus;
    } = {
      paymentStatus: paymentStatus as PaymentStatus,
    };

    // If marking as paid set paidAt and update order status to DELIVERED
    if (paymentStatus === PaymentStatus.PAID) {
      updateData.paidAt = new Date();
      updateData.status = OrderStatus.DELIVERED;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}