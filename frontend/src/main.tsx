import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";
import AuthProvider from "./contexts/AuthProvider.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { Toaster } from "@/components/ui/toast.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TooltipProvider>

      <Toaster />
    </BrowserRouter>
  </StrictMode>,
);
