import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      hasVariants,
      variants,
    } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
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

    // Update product with or without variants
    if (hasVariants && variants && variants.length > 0) {
      // Delete existing variants first
      await prisma.productVariant.deleteMany({
        where: { productId: id },
      });

      // Update product with new variants
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || null,
          price: 0, // Base price not used for variant products
          compareAtPrice: null,
          costPrice: null,
          stock: 0, // Total stock calculated from variants
          sku: sku?.trim() || null,
          categoryId: categoryId || null,
          images: images || [],
          isActive,
          isFeatured,
          hasVariants: true,
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
    } else {
      // Delete variants if switching from variant to simple product
      if (existingProduct.hasVariants) {
        await prisma.productVariant.deleteMany({
          where: { productId: id },
        });
      }

      // Update simple product
      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || null,
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

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete product (variants will be cascade deleted)
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