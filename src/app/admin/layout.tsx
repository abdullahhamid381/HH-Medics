import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminRealtimeListener } from "@/components/admin/realtime-listener";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminRealtimeListener />
      <AdminSidebar />
      <div className="flex-1">
        <AdminMobileNav />
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
