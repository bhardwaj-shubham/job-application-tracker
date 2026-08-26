import { Link, Outlet } from "react-router";

const AppLayout = () => {
  return (
    <div>
      <aside>
        <h2>Job Tracker</h2>

        <nav>
          <Link to="/app/dashboard">Dashboard</Link>
          <Link to="/app/applications">Applications</Link>
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
