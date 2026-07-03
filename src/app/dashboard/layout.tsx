import { requireAuth } from "@/features/auth/actions";
import { AppSidebar } from "@/components/sidebar";
import { UserMenu } from "@/components/user-menu";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { QueryProvider } from "@/features/providers/query-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar userRole={session.user.role || "user"} />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-red-500/20 bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 bg-red-500/20"
          />
          <span className="text-sm text-muted-foreground">Dashboard</span>
          <div className="ml-auto">
            <UserMenu
              userName={session.user.name || "User"}
              userEmail={session.user.email}
              userRole={session.user.role || "user"}
            />
          </div>
        </header>
        <main className="flex-1 p-6">
          {" "}
          <QueryProvider>{children}</QueryProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
