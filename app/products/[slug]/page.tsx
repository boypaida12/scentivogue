import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoreLayout from "@/components/store/store-layout";
import ProductDetailClient from "@/components/store/product-detail-client";
import { transformProductWithVariants } from "@/lib/product-helpers";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const productData = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      variants: true,
    },
  });

  if (!productData) {
    notFound();
  }

  // ✅ Single line transformation
  const product = transformProductWithVariants(productData);

  return (
    <StoreLayout>
      <ProductDetailClient product={product} />
    </StoreLayout>
  );
}