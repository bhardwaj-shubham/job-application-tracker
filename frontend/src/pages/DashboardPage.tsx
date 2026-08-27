import useAuth from "../hooks/useAuth";

const DashboardPage = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name ?? "Guest"}</p>
      <p>{user?.email}</p>
      {user && <button onClick={handleLogout}>Logout</button>}
    </main>
  );
};

export default DashboardPage;
