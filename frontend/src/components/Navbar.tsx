import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, User, X, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/context/cart-store";

const links = [
  { to: "/home", label: "Inicio" },
  { to: "/catalog", label: "Restaurantes" },
  // { to: "/orders", label: "Pedidos" },
  // { to: "/my-impact", label: "Mi impacto" },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#009951]">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        {/* Izquierda: logo + links desktop */}
        <div className="flex min-w-0 items-center gap-8">
          <NavLink to="/home" className="flex shrink-0 items-center" aria-label="EcoBite - inicio">
            <img
              src="/images/logo-eco-02.png"
              alt="EcoBite"
              width={454}
              height={115}
              fetchPriority="high"
              className="h-8 w-auto object-contain"
            />
          </NavLink>

          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((link) => (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "relative pb-1 text-sm font-medium text-[#FFFFFF] transition-colors hover:text-[#FFFFFF]",
                      isActive && "text-[#FFFFFF] after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-[#FFFFFF]"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Derecha desktop */}
        <div className="hidden items-center gap-5 lg:flex text-[#FFFFFF]">
          <button
            type="button"
            aria-label={
              totalItems > 0
                ? `Mi carrito, ${totalItems} productos`
                : "Mi carrito"
            }
            onClick={() => navigate("/cart")}
            className="relative grid size-9 place-items-center rounded-md transition-colors hover:bg-[#FFFFFF]/20 cursor-pointer"
          >
            <ShoppingCart className="size-6 font-bold" color="white" aria-hidden="true" />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-[#FFFFFF] px-1 py-0.5 text-[10px] font-bold leading-none text-[#003D29] tabular-nums"
              >
                {totalItems}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label="Mi cuenta"
            onClick={() => navigate('/auth')}
            className="grid size-9 place-items-center rounded-full transition-colors hover:bg-[#FFFFFF]/20 cursor-pointer"
          >
            <User className="size-6 font-bold" color="#FFFFFF" aria-hidden="true" />
          </button>
        </div>

        {/* Botón hamburguesa */}
        <Button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="bg-transparent! cursor-pointer grid size-10 place-items-center rounded-md text-[#FFFFFF]! transition-colors lg:hidden"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-8" aria-hidden="true" />}
        </Button>
      </nav>

      {/* Panel mobile */}
      <div
        className={cn(
          "grid overflow-hidden border-[#FFFFFF]/60 transition-[grid-template-rows,border] duration-300 lg:hidden",
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr] border-t-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="space-y-1 px-4 py-4 sm:px-6">
            {links.map((link) => (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors",
                      isActive && "bg-[#FFFFFF]/20 text-white"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="flex items-center justify-end gap-3 px-3 pt-3">
              <button
                type="button"
                aria-label={
                  totalItems > 0
                    ? `Mi carrito, ${totalItems} productos`
                    : "Mi carrito"
                }
                onClick={() => navigate('/cart')}
                className="relative grid size-9 place-items-center rounded-full transition-colors hover:bg-[#FFFFFF]/20 cursor-pointer"
              >
                <ShoppingCart className="size-6 font-bold" color="white" aria-hidden="true" />
                {totalItems > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-[#FFFFFF] px-1 py-0.5 text-[10px] font-bold leading-none text-[#003D29] tabular-nums"
                  >
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                type="button"
                aria-label="Mi cuenta"
                onClick={() => navigate('/auth')}
                className="grid size-9 place-items-center rounded-full transition-colors hover:bg-[#FFFFFF]/20 cursor-pointer"
              >
                <User className="size-6 font-bold" color="white" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
