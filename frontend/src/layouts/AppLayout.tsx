import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { Outlet } from "react-router";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4">
          <SidebarTrigger />

          <div className="flex items-center gap-4">
            <span>{user?.name}</span>

            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
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
