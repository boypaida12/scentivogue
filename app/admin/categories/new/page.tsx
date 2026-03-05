import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminHeader from "@/components/admin/admin-header";
import CategoryCreateForm from "./category-create-form";

export default async function NewCategoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <>
      <AdminHeader title="Create Category" description="Add a new category to organize your products"/>
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <CategoryCreateForm />
        </div>
      </div>
    </>
  );
}