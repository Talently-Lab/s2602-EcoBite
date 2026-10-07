import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, MapPin, Menu, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const links = [
  { to: "/dashboard", label: "Inicio" },
  { to: "/catalog", label: "Restaurantes" },
  { to: "/orders", label: "Pedidos" },
  { to: "/my-impact", label: "Mi impacto" },
];

export const Navbar = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
      >
        {/* Izquierda: logo + links desktop */}
        <div className="flex min-w-0 items-center gap-8">
          <NavLink to="/dashboard" className="flex shrink-0 items-center" aria-label="EcoBite - inicio">
            <img
              src="/images/logo-eco-01.png"
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
                      "relative pb-1 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground",
                      isActive && "text-foreground after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-foreground"
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
        <div className="hidden items-center gap-5 lg:flex">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            <MapPin className="size-4" aria-hidden="true" />
            <span>Ubicación</span>
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Mi cuenta"
            className="grid size-8 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <User className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Botón hamburguesa */}
        <Button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="cursor-pointer grid size-10 place-items-center rounded-md text-foreground transition-colors hover:bg-muted lg:hidden"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Menu className="size-6" aria-hidden="true" />}
        </Button>
      </nav>

      {/* Panel mobile */}
      <div
        className={cn(
          "grid overflow-hidden border-border/60 transition-[grid-template-rows,border] duration-300 lg:hidden",
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
                      "block rounded-md px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground underline underline-offset-4"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="flex items-center gap-3 px-3 pt-3">
              <button
                type="button"
                className="flex flex-1 items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
              >
                <MapPin className="size-4" aria-hidden="true" />
                <span>Ubicación</span>
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Mi cuenta"
                className="grid size-9 place-items-center rounded-full border border-border text-foreground/70 hover:bg-muted hover:text-foreground"
              >
                <User className="size-5" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
