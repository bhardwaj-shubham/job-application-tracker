import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router";
import AppSidebar from "./AppSidebar";
import ProfileMenu from "@/components/profile/ProfileMenu";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4">
          <SidebarTrigger />

          <div className="flex items-center gap-4">
            <ProfileMenu />
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
