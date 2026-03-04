import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  // Fetch stats
  const [totalProducts, totalOrders, totalCustomers, revenue] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
    ]);

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      href: "/admin/products",
      color: "bg-[#00AEEF]",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      href: "/admin/orders",
      color: "bg-[#FF8C00]",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      href: "#",
      color: "bg-purple-500",
    },
    {
      title: "Revenue (Paid)",
      value: `GH₵ ${(revenue._sum.total || 0).toFixed(2)}`,
      icon: DollarSign,
      href: "#",
      color: "bg-green-500",
    },
  ];

  return (
    <>
      {/* Header with Sidebar Trigger */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="mb-8">
            <p className="text-gray-600 mt-1">
              Welcome back, {session.user?.name || "Admin"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Products Card */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Manage your product inventory
                </p>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/admin/products">
                      View Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/products/new">Add Product</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders Card */}
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  View and manage customer orders
                </p>
                <Button asChild>
                  <Link href="/admin/orders">
                    View All Orders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}