import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CategoriesTable from "@/components/admin/categories-table";
import CreateCategoryDialog from "@/components/admin/create-category-dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
          <h1 className="text-xl font-semibold">Categories</h1>
          <p className="text-gray-600">
            Organize your products into categories
          </p>
        </div>
      </header>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-end items-center mb-8">
            <div className="flex gap-2">
              <CreateCategoryDialog
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                }
              />
            </div>
          </div>

          {/* Categories Table */}
          {categories.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-white">
              <p className="text-gray-500 mb-4">No categories yet</p>
              <CreateCategoryDialog
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Category
                  </Button>
                }
              />
            </div>
          ) : (
            <CategoriesTable categories={categories} />
          )}
        </div>
      </div>
    </>
  );
}
