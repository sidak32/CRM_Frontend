import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Navigate } from "react-router-dom";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import CampaignManagementApp from "../pages/homepage.jsx"; // ✅ fixed relative path
import LoginPage from "../pages/loginpage.jsx";

// Define routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Default redirect to /homepage */}
      <Route index element={<Navigate to="/login" replace />} />
      <Route path="homepage" element={<CampaignManagementApp />} />
       <Route path="login" element={<LoginPage />} />
    </Route>
  )
);

// Render app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
