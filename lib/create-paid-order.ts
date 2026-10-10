import { prisma } from "@/lib/prisma";

type PaidOrderItem = {
  productId: string;
  variantId?: string | null;
  bundleItemsSelected?: string[];
  quantity: number | string;
  price: number | string;
  name?: string;
};

type PaystackTransaction = {
  reference: string;
  customer: { email: string };
  metadata: {
    customerName: string;
    customerPhone: string;
    shipping: { address: string; city: string; region?: string };
    items: PaidOrderItem[];
    paymentMethod: string;
    notes?: string;
    subtotal: number | string;
    shippingCost: number | string;
    total: number | string;
  };
};

// Creates the order for a successful Paystack transaction.
// Called by both the webhook and the verify fallback, so it must be idempotent:
// an advisory lock on the reference stops the two from creating duplicates when they race.
export async function createPaidOrder(tx: PaystackTransaction) {
  const { reference, metadata } = tx;
  const email = tx.customer.email;
  const { customerName, customerPhone, shipping, items, paymentMethod, notes } = metadata;

  return prisma.$transaction(
    async (db) => {
      await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${reference}))`;

      const existingOrder = await db.order.findFirst({
        where: { paymentReference: reference },
      });
      if (existingOrder) {
        return { order: existingOrder, created: false };
      }

      const customer = await db.customer.upsert({
        where: { email },
        update: {},
        create: { email, name: customerName, phone: customerPhone },
      });

      const order = await db.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          customerId: customer.id,
          shippingName: customerName,
          shippingEmail: email,
          shippingPhone: customerPhone,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingRegion: shipping.region || null,
          // Paystack metadata can come back as strings
          subtotal: parseFloat(String(metadata.subtotal)),
          shippingCost: parseFloat(String(metadata.shippingCost)),
          total: parseFloat(String(metadata.total)),
          paymentMethod,
          paymentStatus: "PAID",
          paymentReference: reference,
          paidAt: new Date(),
          status: "PROCESSING",
          notes: notes || null,
          items: {
            create: items.map((item) => ({
              productId: item.variantId ? null : item.productId,
              variantId: item.variantId || null,
              bundleItemsSelected: item.bundleItemsSelected?.length
                ? JSON.stringify(item.bundleItemsSelected)
                : null,
              quantity: parseInt(String(item.quantity)),
              price: parseFloat(String(item.price)),
              productName: item.name || "Unknown Product",
            })),
          },
        },
      });

      // updateMany (not update) so a stale/deleted ID is skipped instead of
      // throwing and rolling back a paid order
      for (const item of items) {
        const quantity = parseInt(String(item.quantity));
        if (item.bundleItemsSelected && item.bundleItemsSelected.length > 0) {
          await db.bundleItem.updateMany({
            where: { id: { in: item.bundleItemsSelected } },
            data: { stock: { decrement: quantity } },
          });
        } else if (item.variantId) {
          await db.productVariant.updateMany({
            where: { id: item.variantId },
            data: { stock: { decrement: quantity } },
          });
        } else {
          await db.product.updateMany({
            where: { id: item.productId },
            data: { stock: { decrement: quantity } },
          });
        }
      }

      return { order, created: true };
    },
    { timeout: 20000 }
  );
}
