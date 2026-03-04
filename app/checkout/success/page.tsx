import { Suspense } from "react";
import CheckoutSuccessContent from "./success-content";
import { Loader2 } from "lucide-react";
import StoreLayout from "@/components/store/store-layout";

export default function CheckoutSuccessPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-16">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading...</p>
            </div>
          }
        >
          <CheckoutSuccessContent />
        </Suspense>
      </div>
    </StoreLayout>
  );
}