import { type ReactNode } from "react";
import { AppSidebar } from "@neolaner/ui/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@neolaner/ui/components/ui/breadcrumb";
import { Separator } from "@neolaner/ui/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@neolaner/ui/components/ui/sidebar";
import locale from "~/lib/locale";
import { NavUser } from "@neolaner/ui/components/nav-user";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import { signoutAction } from "~/server/action/signoutAction";

async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.session.userId
    ? await api.users.getUser({ id: session?.session.userId })
    : undefined;

  return (
    <SidebarProvider>
      <AppSidebar
        side={locale.dir === "ltr" ? "left" : "right"}
        footer={
          <NavUser
            userData={{
              name: user?.name,
              email: user?.email,
              image: user?.image ?? "",
            }}
            signoutAction={signoutAction}
          />
        }
      />
      <SidebarInset>
        <header className="mb-2 flex shrink-0 flex-col gap-2 border-b py-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Customer Management</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Customers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardLayout;
