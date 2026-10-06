import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import BundleTemplateForm from "@/components/admin/bundle-template-form";

export default async function NewTemplatePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <BundleTemplateForm />
      </div>
    </div>
  );
}