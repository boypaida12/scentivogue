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
type BundleItemInput = {
  id?: string;
  name: string;
  sku: string | null;
  stock: number;
  attributes: Record<string, string>;
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
  productType: "simple" | "variant" | "bundle";
  hasVariants: boolean;
  isSaleActive: boolean;
  saleStartDate: string | null;
  saleEndDate: string | null;
  bundleItemsPerSet?: number | null;
  bundlePrice?: string | null;
  bundleCompareAtPrice?: string | null;
  bundleCostPrice?: string | null;
  bundleItems?: BundleItemInput[];
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
      productType,          
      hasVariants,
      isSaleActive,
      saleStartDate,
      saleEndDate,
      bundleItemsPerSet,    
      bundlePrice,          
      bundleCompareAtPrice, 
      bundleCostPrice,      
      bundleItems,          
      variants,
    } = body;

    console.log("========================================");
    console.log("📥 API RECEIVED:");
    console.log("  productType:", productType);
    console.log("  hasVariants:", hasVariants);
    console.log("  variants count:", variants?.length);
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

    // ✅ NEW: Handle Bundle Products
    if (productType === "bundle") {
      console.log("✅ CREATING BUNDLE PRODUCT");

      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description: description || null,
          productType: "bundle",
          bundleItemsPerSet,
          bundlePrice: bundlePrice ? parseFloat(bundlePrice) : 0,
          bundleCompareAtPrice: bundleCompareAtPrice ? parseFloat(bundleCompareAtPrice) : null,
          bundleCostPrice: bundleCostPrice ? parseFloat(bundleCostPrice) : null,
          // Set simple product fields to defaults
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
          // ✅ Create bundle items
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

      console.log("✅ BUNDLE PRODUCT CREATED!");
      return NextResponse.json(product);
    }
    // Handle Variant Products
    else if (hasVariants && variants && variants.length > 0) {
      console.log("✅ CREATING PRODUCT WITH VARIANTS");

      const product = await prisma.product.create({
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

      console.log("✅ PRODUCT WITH VARIANTS CREATED!");
      return NextResponse.json(product);
    }
    // Handle Simple Products
    else {
      console.log("Creating simple product (no variants)");

      const product = await prisma.product.create({
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

      console.log("✅ SIMPLE PRODUCT CREATED!");
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