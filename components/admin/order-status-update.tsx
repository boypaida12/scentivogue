"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, Truck } from "lucide-react";

type OrderStatusUpdateProps = {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  paymentMethod: string;
};

export default function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentPaymentStatus,
  paymentMethod,
}: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const isCOD = paymentMethod.toLowerCase() === "cod";
  const isCODPaid = isCOD && currentPaymentStatus === "PAID";

  // Update order status
  const handleStatusUpdate = async () => {
    if (status === currentStatus) {
      alert("Status hasn't changed");
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Mark COD order as paid
  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/payment-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "PAID" }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* COD Payment Collection */}
      {isCOD && (
        <div className="space-y-3">
          <Label>Cash Payment Status</Label>
          {isCODPaid ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Cash Collected</p>
                <p className="text-xs text-green-600">
                  Payment has been received
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Truck className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">
                    Awaiting Cash Payment
                  </p>
                  <p className="text-xs text-amber-600">
                    Mark as paid once cash is collected on delivery
                  </p>
                </div>
              </div>

              {/* Confirm before marking as paid */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isMarkingPaid}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isMarkingPaid ? "Processing..." : "Mark Cash as Collected"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Cash Collection</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you have collected the cash payment for this
                      order? This will mark the order as PAID and DELIVERED.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleMarkAsPaid}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Yes, Cash Collected
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      )}

      {/* Divider for COD orders */}
      {isCOD && <div className="border-t" />}

      {/* Order Status Update */}
      <div className="space-y-3">
        <Label>Order Status</Label>

        {/* Current Status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Current:</span>
          <Badge
            variant="secondary"
            className={
              currentStatus === "DELIVERED"
                ? "bg-green-100 text-green-800"
                : currentStatus === "SHIPPED"
                ? "bg-purple-100 text-purple-800"
                : currentStatus === "PROCESSING"
                ? "bg-blue-100 text-blue-800"
                : currentStatus === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {currentStatus}
          </Badge>
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleStatusUpdate}
          disabled={isUpdatingStatus || status === currentStatus}
          className="w-full"
          variant="outline"
        >
          {isUpdatingStatus ? "Updating..." : "Update Order Status"}
        </Button>
      </div>
    </div>
  );
}