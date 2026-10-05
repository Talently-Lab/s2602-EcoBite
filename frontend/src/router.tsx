import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Catalog = lazy(() => import('./pages/Catalog'));
const DetailProduct = lazy(() => import('./pages/DetailProduct'));
const Cart = lazy(() => import('./pages/Cart'));
const Auth = lazy(() => import('./pages/Auth'));  

export const mainRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/auth" replace /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/catalog", element: <Catalog /> },
  { path: "/detail-product", element: <DetailProduct /> },
  { path: "/cart", element: <Cart /> },
  { path: "/auth", element: <Auth /> },
  { path: "*", element: <NotFound /> }
])