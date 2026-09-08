import { Navigate, Outlet } from "react-router";
import useAuth from "@/hooks/useAuth";

const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
