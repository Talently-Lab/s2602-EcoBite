import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Catalog = lazy(() => import('./pages/Catalog'));
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'));
const Auth = lazy(() => import('./pages/Auth'));  
const Orders = lazy(() => import('./pages/Orders'));
const MyImpact = lazy(() => import('./pages/MyImpact'));
const ShoppingCart = lazy(() => import('./pages/ShoppingCart'));

export const mainRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/home" replace /> },
  { path: "/home", element: <Home /> },
  { path: "/catalog", element: <Catalog /> },
  { path: "/catalog/:id", element: <RestaurantDetail /> },
  { path: "/auth", element: <Auth /> },
  { path: "/orders", element: <Orders /> },
  { path: "/my-impact", element: <MyImpact /> },
  { path: "/cart", element: <ShoppingCart /> },
  { path: "*", element: <NotFound /> }
])