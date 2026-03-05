import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Proper type definition for incoming filters
type CategoryFilterInput = {
  id?: string; // Optional because it might be a new filter
  name: string;
  options: string[];
};

type RequestBody = {
  filters: CategoryFilterInput[];
};

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
    const body = (await request.json()) as RequestBody;
    const { filters } = body;

    // Validate filters structure
    if (!Array.isArray(filters)) {
      return NextResponse.json(
        { error: "Filters must be an array" },
        { status: 400 }
      );
    }

    // Delete existing filters
    await prisma.categoryFilter.deleteMany({
      where: { categoryId: id },
    });

    // Create new filters
    if (filters.length > 0) {
      // Validate each filter before creating
      const validFilters = filters.filter(
        (filter): filter is CategoryFilterInput =>
          typeof filter.name === "string" &&
          filter.name.trim() !== "" &&
          Array.isArray(filter.options) &&
          filter.options.length > 0 &&
          filter.options.every((opt) => typeof opt === "string")
      );

      if (validFilters.length > 0) {
        await prisma.categoryFilter.createMany({
          data: validFilters.map((filter) => ({
            categoryId: id,
            name: filter.name,
            options: filter.options,
          })),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category filters:", error);
    return NextResponse.json(
      { error: "Failed to update filters" },
      { status: 500 }
    );
  }
}