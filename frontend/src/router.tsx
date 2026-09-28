import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const mainRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "*", element: <NotFound />}
])