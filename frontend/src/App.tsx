import { Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import CreateApplicationPage from "./pages/CreateApplicationPage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";
import AppLayout from "./layouts/AppLayout";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/new" element={<CreateApplicationPage />} />
        <Route path="applications/:id" element={<ApplicationDetailsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
