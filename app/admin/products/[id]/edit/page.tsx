import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/admin/admin-header";
import ProductForm from "@/components/admin/product-form";
import { transformProductWithVariants } from "@/lib/product-helpers";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const [productData, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!productData) notFound();

  const product = transformProductWithVariants(productData);

  return (
    <>
      <AdminHeader title="Edit Product" />
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <ProductForm categories={categories} initialData={product} />
        </div>
      </div>
    </>
  );
}