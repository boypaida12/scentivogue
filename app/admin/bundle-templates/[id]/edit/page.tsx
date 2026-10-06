import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BundleTemplateForm from "@/components/admin/bundle-template-form";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const template = await prisma.bundleTemplate.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <BundleTemplateForm initialData={template} />
      </div>
    </div>
  );
}