import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu as DropdownMenu } from "@base-ui/react/menu";
import { ChevronDown, Menu, UserRound, X, ShoppingCart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/context/cart-store";
import { useAuthStore } from "@/context/auth-store";

const navigationClass = "flex min-h-11 items-center gap-2 rounded-sm px-2 text-base font-bold text-white hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
const menuItemClass = "block cursor-pointer px-5 py-2 text-center text-sm text-[#161616] outline-none hover:bg-black/10 data-highlighted:bg-black/10";

function NavigationMenu({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger openOnHover className={cn(navigationClass, "group w-full cursor-pointer justify-between")}>
        {label}
        <ChevronDown aria-hidden="true" className="size-5 transition-transform group-data-popup-open:rotate-180" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Positioner sideOffset={0} align="start" className="z-60">
          <DropdownMenu.Popup className="min-w-36 bg-[#e8e8e8] py-1 shadow-sm outline-none">
            {children}
          </DropdownMenu.Popup>
        </DropdownMenu.Positioner>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const Navbar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  const session = useAuthStore((s) => s.session);
  const clearSession = useAuthStore((s) => s.clearSession);
  const signedIn = session !== null;

  useEffect(() => {
    if (!session) return;
    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      clearSession();
      return;
    }
    const timeout = window.setTimeout(clearSession, remaining);
    return () => window.clearTimeout(timeout);
  }, [session, clearSession]);
  const totalItems = useCartStore((s) =>
    s.items.reduce((acc, item) => acc + item.quantity, 0)
  );
  const closeMenu = () => setOpen(false);
  const logout = () => {
    clearSession();
    queryClient.clear();
    closeMenu();
    navigate("/home");
  };
  const authLinks = (
    <>
      <DropdownMenu.LinkItem closeOnClick render={<NavLink to="/auth" onClick={closeMenu} />} className={menuItemClass}>
        Iniciá sesión
      </DropdownMenu.LinkItem>
      <DropdownMenu.LinkItem closeOnClick render={<NavLink to="/auth?mode=register" onClick={closeMenu} />} className={menuItemClass}>
        Registrate
      </DropdownMenu.LinkItem>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-[#009951] text-white">
      <nav aria-label="Navegación principal" className="relative mx-auto flex min-h-24 max-w-[1248px] flex-wrap items-center justify-between gap-x-8 px-5 py-5 sm:px-6 xl:min-h-29 xl:flex-nowrap xl:gap-x-12">
        <NavLink to="/home" onClick={closeMenu} className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" aria-label="EcoBite - inicio">
          <img src="/images/logo-eco-02.png" alt="EcoBite" width={454} height={115} fetchPriority="high" className="h-auto w-42 object-contain" />
        </NavLink>

        <button ref={menuToggle} type="button" onClick={() => setOpen((value) => !value)} aria-controls="main-navigation" aria-expanded={open} aria-label={open ? "Cerrar menú" : "Abrir menú"} className={cn(navigationClass, "cursor-pointer xl:hidden")}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <ul id="main-navigation" onKeyDown={(event) => {
          if (event.key === "Escape" && open && !event.defaultPrevented) {
            closeMenu();
            menuToggle.current?.focus();
          }
        }} className={cn("w-full flex-col gap-2 border-t border-white/30 pt-4 xl:flex xl:w-auto xl:flex-1 xl:flex-row xl:items-center xl:gap-5 xl:border-0 xl:pt-0", open ? "flex" : "hidden")}>
          <li><NavLink to="/home" onClick={closeMenu} className={navigationClass}>Inicio</NavLink></li>
          <li><NavLink to="/catalog" onClick={closeMenu} className={navigationClass}>Restaurante</NavLink></li>
          <li className="xl:ml-auto">
            <NavigationMenu label={<span className="flex items-center gap-2"><UserRound aria-hidden="true" className="size-7" />Mi perfil</span>}>
              {signedIn ? (
                <DropdownMenu.Item onClick={logout} className={cn(menuItemClass, "w-full")}>Cerrar sesión</DropdownMenu.Item>
              ) : authLinks}
            </NavigationMenu>
          </li>
          <li>
            <NavLink to="/cart" onClick={closeMenu} aria-label={totalItems > 0 ? `Mi carrito, ${totalItems} productos` : "Mi carrito"} className={cn(navigationClass, "relative justify-center")}>
              <ShoppingCart aria-hidden="true" className="size-6" />
              <span className="xl:sr-only">Mi carrito</span>
              {totalItems > 0 && <span aria-hidden="true" className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-white px-1 text-xs font-bold text-[#003d29]">{totalItems}</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};
