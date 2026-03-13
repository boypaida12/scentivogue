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

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    console.log("========================================");
    console.log("📥 API RECEIVED:");
    console.log("  hasVariants:", hasVariants);
    console.log("  variants count:", variants?.length);
    console.log("  variants data:", JSON.stringify(variants, null, 2));
    console.log("========================================");

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    // Create product with or without variants
    if (hasVariants && variants && variants.length > 0) {
      console.log("✅ CREATING PRODUCT WITH VARIANTS");

      const variantsToCreate = variants.map((variant, index) => {
        const variantData = {
          name: variant.name,
          attributes: variant.attributes, 
          price: variant.price,
          compareAtPrice: variant.compareAtPrice || null,
          costPrice: variant.costPrice || null,
          stock: variant.stock,
          sku: variant.sku?.trim() || null,
        };

        console.log(`  📦 Variant ${index + 1} to create:`, JSON.stringify(variantData, null, 2));
        return variantData;
      });

      console.log("🔄 CALLING PRISMA CREATE...");

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description: description || null,
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
          variants: {
            create: variantsToCreate,
          },
        },
        include: {
          variants: true,
          category: true,
        },
      });

      console.log("✅ PRODUCT CREATED SUCCESSFULLY!");
      console.log("  Product ID:", product.id);
      console.log("  Product name:", product.name);
      console.log("  Variants created:", product.variants.length);
      console.log("  Variant details:");
      product.variants.forEach((v, i) => {
        console.log(`    Variant ${i + 1}:`, {
          id: v.id,
          name: v.name,
          price: v.price,
          stock: v.stock,
          variants: v.attributes
        });
      });
      console.log("========================================");

      return NextResponse.json(product);
    } else {
      console.log("Creating simple product (no variants)");

      const product = await prisma.product.create({
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
    console.error("========================================");
    console.error("❌ ERROR CREATING PRODUCT:");
    console.error(error);
    console.error("========================================");

    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}