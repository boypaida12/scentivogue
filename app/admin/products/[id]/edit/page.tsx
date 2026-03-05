import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/admin/admin-header";
import ProductForm from "@/components/admin/product-form";

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

  const product = {
    id: productData.id,
    name: productData.name,
    slug: productData.slug,
    description: productData.description,
    price: productData.price,
    compareAtPrice: productData.compareAtPrice,
    costPrice: productData.costPrice,
    sku: productData.sku,
    stock: productData.stock,
    images: productData.images,
    categoryId: productData.categoryId,
    isActive: productData.isActive,
    isFeatured: productData.isFeatured,
    hasVariants: productData.hasVariants,
    variants: productData.variants.map((v) => ({
      id: v.id,
      name: v.name,
      attributes: (v.attributes as Record<string, string>) || {},
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      costPrice: v.costPrice,
      stock: v.stock,
      sku: v.sku,
    })),
  };

  return (
    <>
      <AdminHeader title="Edit Product" description="Update product details"/>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <ProductForm categories={categories} initialData={product} />
        </div>
      </div>
    </>
  );
}
