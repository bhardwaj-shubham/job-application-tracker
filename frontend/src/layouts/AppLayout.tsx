import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { Link, Outlet } from "react-router";

const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen min-w-md w-full">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link to="/app/dashboard" className="font-semibold">
          Job Tracker
        </Link>

        <div className="flex items-center gap-4">
          <span>{user?.name}</span>

          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-1/12 md:w-1/5 border-r p-4">
          <nav className="flex flex-col gap-2">
            <Link to="/app/dashboard">Dashboard</Link>
            <Link to="/app/applications">Applications</Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
