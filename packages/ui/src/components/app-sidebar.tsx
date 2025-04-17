"use client";

import { SquareTerminal } from "lucide-react";
import * as React from "react";

import { NavMain } from "@neolaner/ui/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@neolaner/ui/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "کوروش",
    email: "restart~example.com",
    avatar: "/avatars/reset.jpg",
  },
  navMain: [
    {
      title: "locale.crm.title",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "locale.crm.invoices.title",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({
  footer,
  ...props
}: React.ComponentProps<typeof Sidebar> & { footer: React.ReactNode }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg" />
          <div className="grid flex-1 text-left text-sm leading-tight font-bold uppercase">
            NEO SHOP
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
