"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Order = {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    product: {
      name: string;
    };
  }[];
};

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case "momo":
        return "Mobile Money";
      case "card":
        return "Bank Card";
      case "cod":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                #{order.orderNumber}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.customer.name}</div>
                  <div className="text-sm text-gray-500">
                    {order.customer.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {order.items.length}{" "}
                {order.items.length === 1 ? "item" : "items"}
              </TableCell>
              <TableCell className="font-medium">
                GH₵ {order.total.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge
                    variant="secondary"
                    className={getPaymentStatusColor(order.paymentStatus)}
                  >
                    {order.paymentStatus}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {getPaymentMethodBadge(order.paymentMethod)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusColor(order.status)}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
