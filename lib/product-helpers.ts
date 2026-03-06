import { Prisma } from "@prisma/client";

// Type for product with variants from Prisma
type PrismaProductWithVariants = Prisma.ProductGetPayload<{
  include: { category: true; variants: true };
}>;

// Type for transformed variant (what our components expect)
export type TransformedVariant = {
  id: string;
  name: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  sku: string | null;
};

// Type for transformed product
export type TransformedProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  sku: string | null;
  stock: number;
  images: string[];
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  hasVariants: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  variants: TransformedVariant[];
};

/**
 * Transform Prisma product variants to app-friendly format
 * Converts JsonValue attributes to Record<string, string>
 */
export function transformProductWithVariants(
  product: PrismaProductWithVariants
): TransformedProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    costPrice: product.costPrice,
    sku: product.sku,
    stock: product.stock,
    images: product.images,
    categoryId: product.categoryId,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    hasVariants: product.hasVariants,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category,
    variants: product.variants.map((v) => ({
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
}

/**
 * Transform array of products with variants
 */
export function transformProductsWithVariants(
  products: PrismaProductWithVariants[]
): TransformedProduct[] {
  return products.map(transformProductWithVariants);
}