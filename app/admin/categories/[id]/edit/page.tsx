import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "@/components/admin/admin-header";
import CategoryEditForm from "./category-edit-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      filters: true, // Include filters
    },
  });

  if (!category) notFound();

  return (
    <>
      <AdminHeader title="Edit Category" />
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <CategoryEditForm category={category} />
        </div>
      </div>
    </>
  );
}