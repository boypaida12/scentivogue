import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

type WebhookItem = {
    productId: string;
    quantity: number;
    price: number;
    name: string;
};

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get("x-paystack-signature");

        // Verify webhook signature
        // This ensures the request is actually from Paystack
        const hash = crypto
            .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
            .update(body)
            .digest("hex");

        if (hash !== signature) {
            console.error("Invalid webhook signature");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);

        console.log("Webhook event received:", event.event);

        // Only handle successful payments
        if (event.event !== "charge.success") {
            return NextResponse.json({ received: true });
        }

        const { data } = event;
        const { metadata, reference, amount } = data;

        // Check if order already exists for this reference
        // (Paystack can send webhooks multiple times)
        const existingOrder = await prisma.order.findFirst({
            where: { paymentReference: reference },
        });

        if (existingOrder) {
            console.log("Order already exists for reference:", reference);
            return NextResponse.json({ received: true });
        }

        // Extract order data from metadata
        const {
            customerName,
            customerPhone,
            shipping,
            items,
            paymentMethod,
            notes,
            subtotal,
            shippingCost,
            total,
        } = metadata;

        const email = data.customer.email;

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

        // Create the order NOW (after payment confirmed)
        const order = await prisma.order.create({
            data: {
                orderNumber,
                customerId: customer.id,
                shippingName: customerName,
                shippingEmail: email,
                shippingPhone: customerPhone,
                shippingAddress: shipping.address,
                shippingCity: shipping.city,
                shippingRegion: shipping.region || null,
                // Parse numbers explicitly
                subtotal: parseFloat(String(subtotal)),
                shippingCost: parseFloat(String(shippingCost)),
                total: parseFloat(String(total)),
                paymentMethod,
                paymentStatus: "PAID",
                paymentReference: reference,
                paidAt: new Date(),
                status: "PROCESSING",
                notes: notes || null,
                items: {
                    create: items.map((item: WebhookItem) => ({
                        productId: item.productId,
                        quantity: parseInt(String(item.quantity)),
                        price: parseFloat(String(item.price)),
                    })),
                },
            },
        });

        // Reduce product stock
        for (const item of items as WebhookItem[]) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: parseInt(String(item.quantity)),
                    },
                },
            });
        }

        console.log("✅ Order created from webhook:", order.orderNumber);

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}