import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Don't redirect here - login page needs to be accessible
  // Individual pages handle their own protection

  // If logged in, show sidebar layout
  if (session) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 w-full">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Login page - no sidebar
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}