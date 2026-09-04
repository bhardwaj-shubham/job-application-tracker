import { Route, Routes } from "react-router";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import CreateApplicationPage from "./pages/CreateApplicationPage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ResumeAnalysisPage from "./pages/ResumeAnalysisPage";

const App = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route
              path="applications/new"
              element={<CreateApplicationPage />}
            />
            <Route
              path="applications/:id"
              element={<ApplicationDetailsPage />}
            />
            <Route
              path="applications/:id/analysis"
              element={<ResumeAnalysisPage />}
            />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
