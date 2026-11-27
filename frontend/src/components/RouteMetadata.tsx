import { useEffect } from "react";
import { Outlet, useLocation, useMatch } from "react-router-dom";
import { useRestaurantById } from "@/hooks/useRestaurants";

const SITE_URL = "https://s2602-ecobite.netlify.app";
const CATALOG_DESCRIPTION = "Descubrí restaurantes sustentables en CABA, explorá sus menús y elegí comida con envases biodegradables y entregas de menor impacto ambiental.";
const PRIVATE_TITLES: Record<string, string> = {
  "/cart": "Carrito de compras",
  "/checkout": "Entrega y pago",
  "/orders": "Mis pedidos",
  "/my-impact": "Mi impacto ambiental",
};

export function RouteMetadata() {
  const { pathname, search } = useLocation();
  const detail = useMatch("/catalog/:id");
  const { restaurant, error } = useRestaurantById(detail?.params.id ?? "");
  const path = pathname.replace(/\/+$/, "") || "/catalog";
  let title = `${PRIVATE_TITLES[path] ?? (path.startsWith("/voucher/") ? "Comprobante de pedido" : "Página no encontrada")} | EcoBite`;
  let description = "Gestioná tu cuenta y tus pedidos en EcoBite.";
  let indexable = false;

  if (path === "/home") {
    title = "S2602 - ecobite";
    description = "Disfrutá comida de restaurantes sustentables de CABA. Conocé sus prácticas ambientales, explorá sus menús y sumate al cambio con EcoBite.";
    indexable = true;
  } else if (path === "/catalog") {
    title = "Restaurantes sustentables en CABA | EcoBite";
    description = CATALOG_DESCRIPTION;
    indexable = true;
  } else if (detail) {
    title = restaurant ? `Menú de ${restaurant.name} | EcoBite` : "Menú del restaurante | EcoBite";
    description = restaurant ? `Explorá el menú de ${restaurant.name}, ${restaurant.category.toLowerCase()} en ${restaurant.zone.name}, CABA. Elegí tus productos y armá tu pedido en EcoBite.` : CATALOG_DESCRIPTION;
    indexable = !error;
  } else if (path === "/auth") {
    title = new URLSearchParams(search).get("mode") === "register" ? "Crear cuenta | EcoBite" : "Iniciar sesión | EcoBite";
  }

  const canonical = new URL(path, SITE_URL).href;
  const robots = indexable ? "index,follow" : "noindex,follow";
  const socialTitle = path === "/home" ? "EcoBite | Pedí comida y generá menos impacto" : title;

  useEffect(() => {
    document.title = title;
    const values = {
      'meta[name="description"]': description,
      'meta[name="robots"]': robots,
      'meta[property="og:title"]': socialTitle,
      'meta[property="og:description"]': description,
      'meta[property="og:url"]': canonical,
      'meta[name="twitter:title"]': socialTitle,
      'meta[name="twitter:description"]': description,
    };
    for (const [selector, content] of Object.entries(values)) {
      document.head.querySelector(selector)?.setAttribute("content", content);
    }
    document.head.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);
  }, [title, socialTitle, description, robots, canonical]);

  return <Outlet />;
}
