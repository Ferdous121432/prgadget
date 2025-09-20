import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AppLogo from "./shared/header/AppLogo";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 mt-4 data-[orientation=vertical]:h-4"
        />
        <div className="flex flex-1 justify-start items-center gap-4">
          <AppLogo />
          <div className="flex flex-1 justify-end items-center gap-4">
            {/* <AdminSearch /> */}
            {/* <Menu /> */}
          </div>
        </div>
      </div>
    </header>
  );
}
