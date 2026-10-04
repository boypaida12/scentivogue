import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


type BundleItemInput = {
  id?: string;
  name: string;
  sku: string | null;
  stock: number;
  attributes: Record<string, string>;
};

type VariantInput = {
  id?: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  sku: string | null;
};

type ProductInput = {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  sku: string;
  stock: string;
  categoryId: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  productType: "simple" | "variant" | "bundle";
  bundleItemsPerSet?: number | null;
  bundlePrice?: string | null;
  bundleCompareAtPrice?: string | null;
  bundleCostPrice?: string | null;
  bundleItems?: BundleItemInput[]
  isSaleActive: boolean;          
  saleStartDate: string | null;   
  saleEndDate: string | null;     
  variants: VariantInput[];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        bundleItems: true, 
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as ProductInput;
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      costPrice,
      sku,
      stock,
      categoryId,
      images,
      isActive,
      isFeatured,
      productType,          // ✅ ADD THIS
      hasVariants,
      isSaleActive,
      saleStartDate,
      saleEndDate,
      bundleItemsPerSet,    // ✅ ADD THIS
      bundlePrice,          // ✅ ADD THIS
      bundleCompareAtPrice, // ✅ ADD THIS
      bundleCostPrice,      // ✅ ADD THIS
      bundleItems,          // ✅ ADD THIS
      variants,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, bundleItems: true },  // ✅ ADD bundleItems
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if slug is taken by another product
    const slugTaken = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (slugTaken) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    // ✅ NEW: Handle Bundle Products
    if (productType === "bundle") {
      // Delete existing bundle items
      await prisma.bundleItem.deleteMany({
        where: { productId: id },
      });

      // Delete variants if switching from variant
      if (existingProduct.hasVariants) {
        await prisma.productVariant.deleteMany({
          where: { productId: id },
        });
      }

      // Update product with bundle items
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || null,
          productType: "bundle",
          bundleItemsPerSet,
          bundlePrice: bundlePrice ? parseFloat(bundlePrice) : 0,
          bundleCompareAtPrice: bundleCompareAtPrice ? parseFloat(bundleCompareAtPrice) : null,
          bundleCostPrice: bundleCostPrice ? parseFloat(bundleCostPrice) : null,
          price: 0,
          compareAtPrice: null,
          costPrice: null,
          stock: 0,
          sku: null,
          categoryId: categoryId || null,
          images: images || [],
          isActive,
          isFeatured,
          hasVariants: false,
          isSaleActive,
          saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
          saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
          bundleItems: {
            create: (bundleItems || []).map((item) => ({
              name: item.name,
              sku: item.sku,
              stock: item.stock,
              attributes: item.attributes,
            })),
          },
        },
        include: {
          category: true,
          bundleItems: true,
        },
      });

      return NextResponse.json(product);
    }
    // Handle Variant Products
    else if (hasVariants && variants && variants.length > 0) {
      // Delete existing variants
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      // Delete bundle items if switching from bundle
      await prisma.bundleItem.deleteMany({
        where: { productId: id },
      });

      // Update product with new variants
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || null,
          productType: "variant",  // ✅ ADD THIS
          price: 0,
          compareAtPrice: null,
          costPrice: null,
          stock: 0,
          sku: sku?.trim() || null,
          categoryId: categoryId || null,
          images: images || [],
          isActive,
          isFeatured,
          hasVariants: true,
          isSaleActive,
          saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
          saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
          variants: {
            create: variants.map((variant) => ({
              name: variant.name,
              attributes: variant.attributes,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice || null,
              costPrice: variant.costPrice || null,
              stock: variant.stock,
              sku: variant.sku?.trim() || null,
            })),
          },
        },
        include: {
          variants: true,
          category: true,
        },
      });

      return NextResponse.json(product);
    }
    // Handle Simple Products
    else {
      // Delete variants if switching from variant
      if (existingProduct.hasVariants) {
        await prisma.productVariant.deleteMany({
          where: { productId: id },
        });
      }

      // Delete bundle items if switching from bundle
      await prisma.bundleItem.deleteMany({
        where: { productId: id },
      });

      // Update simple product
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || null,
          productType: "simple",  // ✅ ADD THIS
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          stock: parseInt(stock),
          sku: sku?.trim() || null,
          categoryId: categoryId || null,
          images: images || [],
          isActive,
          isFeatured,
          hasVariants: false,
          isSaleActive,
          saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
          saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        },
        include: {
          category: true,
        },
      });

      return NextResponse.json(product);
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}