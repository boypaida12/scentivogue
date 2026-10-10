import { NextResponse } from "next/server";
import crypto from "crypto";
import { createPaidOrder } from "@/lib/create-paid-order";

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

        // Safe to call more than once - Paystack can resend webhooks,
        // and the verify route may have already created this order
        const { order, created } = await createPaidOrder(event.data);

        console.log(
            created ? "✅ Order created from webhook:" : "Order already exists:",
            order.orderNumber
        );

        return NextResponse.json({ received: true });
    } catch (error) {
        // 500 makes Paystack retry the webhook
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
