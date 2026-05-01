"use client";

import { IconUserStar } from "@tabler/icons-react";
import * as React from "react";

import {
  adminCatalogNavItems,
  adminPrimaryNavItems,
} from "@/app/admin/navigation";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import AdminSearch from "./admin/admin-search";
import ToggleButton from "./shared/header/ToggleButton";
import { Button } from "./ui/button";

const data = {
  user: {
    name: "Admin",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: adminPrimaryNavItems.map(({ title, href, icon }) => ({
    title,
    url: href,
    icon,
  })),
  products: adminCatalogNavItems.map(({ title, href, icon }) => ({
    name: title,
    url: href,
    icon,
  })),
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-row justify-between items-center">
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/admin/overview">
                <IconUserStar className="size-5!" />
                <span className="text-base font-semibold">Admin Panel</span>
              </a>
            </SidebarMenuButton>
            <Button
              type="button"
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline">
              <ToggleButton />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments title="Catalog" items={data.products} />
        <div className="px-2 pt-6 w-full">
          <AdminSearch />
        </div>
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
