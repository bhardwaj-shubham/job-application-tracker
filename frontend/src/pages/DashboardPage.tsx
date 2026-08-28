import useAuth from "../hooks/useAuth";

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <p>{user?.email}</p>
    </main>
  );
};

export default DashboardPage;
