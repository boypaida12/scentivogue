import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrdersTable from "@/components/admin/orders-table";
import AdminHeader from "@/components/admin/admin-header";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: {
        include: {
          product: true,
           variant: { 
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <AdminHeader title="Orders" description="Manage customer orders and fulfillment"/>
      <div>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8"></div>

          {/* Orders Table */}
          {orders.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-white">
              <p className="text-gray-500 mb-2">No orders yet</p>
              <p className="text-sm text-gray-400">
                Orders will appear here when customers make purchases
              </p>
            </div>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </div>
      </div>
    </>
  );
}
