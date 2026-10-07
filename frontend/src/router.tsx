import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Catalog = lazy(() => import('./pages/Catalog'));
const DetailProduct = lazy(() => import('./pages/DetailProduct'));
const Auth = lazy(() => import('./pages/Auth'));  
const Orders = lazy(() => import('./pages/Orders'));
const MyImpact = lazy(() => import('./pages/MyImpact'));

export const mainRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/auth" replace /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/catalog", element: <Catalog /> },
  { path: "/detail-product", element: <DetailProduct /> },
  { path: "/auth", element: <Auth /> },
  { path: "/orders", element: <Orders /> },
  { path: "/my-impact", element: <MyImpact /> },
  { path: "*", element: <NotFound /> }
])