import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BundleTemplatesTable from "@/components/admin/bundle-templates-table";
import AdminHeader from "@/components/admin/admin-header";

export default async function BundleTemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const templates = await prisma.bundleTemplate.findMany({
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <AdminHeader
        title="Bundle Templates"
        description="Create reusable bundle item collections"
      />
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-end items-center mb-8">
            <Button asChild>
              <Link href="/admin/bundle-templates/new">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Link>
            </Button>
          </div>

          {/* Templates Table */}
          {templates.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-white">
              <p className="text-gray-500 mb-4">No templates yet</p>
              <p className="text-sm text-gray-400 mb-6">
                Create bundle templates to reuse across multiple products
              </p>
              <Button asChild>
                <Link href="/admin/bundle-templates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Link>
              </Button>
            </div>
          ) : (
            <BundleTemplatesTable templates={templates} />
          )}
        </div>
      </div>
    </>
  );
}