import { ChevronRight, Cloud, Leaf, Minus, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/pages/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/context/cart-store";
import { isAuthenticated } from "@/context/auth-store";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const ShoppingCart = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const increase = useCartStore((s) => s.increase);
  const decrease = useCartStore((s) => s.decrease);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <MainLayout spacious>
      <nav aria-label="Ruta de navegación" className="flex items-center gap-3 text-sm text-[#2c2c2a]">
        <Link to="/catalog" className="hover:underline">Restaurantes</Link>
        <ChevronRight aria-hidden="true" className="size-4" />
        <span aria-current="page" className="font-bold">Carrito</span>
      </nav>

      <h1 className="sr-only">Carrito</h1>

      <section aria-label="Detalle del pedido" className="mt-8 grid items-start gap-8 pb-16 lg:grid-cols-[minmax(0,588fr)_minmax(0,564fr)] lg:gap-12">
        <div className="min-w-0">
          {items.length === 0 ? (
            <div className="space-y-4 py-12 text-center">
              <p className="text-[#545454]">Tu carrito está vacío.</p>
              <Link to="/catalog" className="font-semibold text-[#00733d] underline">Explorá los restaurantes</Link>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.productId} className="flex flex-wrap items-center gap-4 border-b border-[#8a8a8a] px-4 py-6 sm:flex-nowrap sm:gap-6">
                  <img src={item.image} alt={item.name} width={90} height={84} className="h-21 w-22 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg leading-tight text-black sm:text-xl">{item.name}</p>
                    <p className="mt-3 text-2xl font-bold text-[#003d29]">{formatPrice(item.price)}</p>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                    <button type="button" onClick={() => decrease(item.productId)} disabled={item.quantity <= 1} aria-label={`Quitar una unidad de ${item.name}`} className="grid size-8 place-items-center rounded-lg border border-[#009951] text-[#009951] hover:bg-[#e6fdef] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
                      <Minus className="size-5" aria-hidden="true" />
                    </button>
                    <span aria-live="polite" aria-label={`${item.quantity} unidades de ${item.name}`} className="w-5 text-center text-sm font-bold text-[#2c2c2a] tabular-nums">{String(item.quantity).padStart(2, "0")}</span>
                    <button type="button" onClick={() => increase(item.productId)} aria-label={`Agregar una unidad de ${item.name}`} className="grid size-8 place-items-center rounded-lg bg-[#009951] text-white hover:bg-[#00733d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00733d]">
                      <Plus className="size-6" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => removeItem(item.productId)} aria-label={`Eliminar ${item.name} del carrito`} className="ml-2 grid size-8 place-items-center rounded-lg text-[#009951] hover:bg-[#e6fdef] focus-visible:outline-2 focus-visible:outline-offset-2">
                      <Trash2 className="size-5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <section aria-labelledby="cart-summary" className="mt-6 border-t border-[#b5b5b5] pt-3">
            <h2 id="cart-summary" className="text-2xl font-bold text-[#2c2c2a]">Resumen</h2>
            <dl className="mt-3 space-y-1 border-b border-[#b5b5b5] pb-3 text-xl text-[#2c2c2a]">
              <div className="flex justify-between gap-4"><dt>Productos</dt><dd>{formatPrice(subtotal)}</dd></div>
            </dl>
            <div className="mt-3 flex justify-between gap-4 text-xl font-bold text-[#2c2c2a]"><span>TOTAL</span><span>{formatPrice(subtotal)}</span></div>
            <Button type="button" disabled={items.length === 0} onClick={() => {
              if (isAuthenticated()) {
                navigate("/checkout");
                return;
              }
              navigate("/auth", { state: { from: "/checkout" } });
            }} className="mt-6 h-10 rounded-lg bg-[#009951]! px-6 text-sm font-bold text-white!">Ir a pagar</Button>
          </section>
        </div>

        <Card className="min-h-[348px] rounded-2xl border border-[#e8e8e8] bg-white! p-6 ring-0 shadow-sm">
          <CardContent className="p-0">
            <h2 className="text-2xl font-bold leading-tight text-black sm:text-[32px]">Confirmá tu pedido y conocé su impacto estimado.</h2>
            <ul className="mt-12 space-y-6">
              <li className="flex items-center gap-3">
                <span aria-hidden="true" className="relative grid size-9 shrink-0 place-items-center rounded-full bg-[#0b0b0b] text-[#04e762]"><Cloud className="size-6" /><span className="absolute bottom-1 text-[8px] font-bold">CO₂</span></span>
                <p className="text-xl text-black sm:text-2xl">Ahorro estimado de CO₂</p>
              </li>
              <li className="flex items-center gap-3">
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#04e762] text-[#003d29]"><Leaf className="size-5 fill-current" /></span>
                <p className="text-xl text-black sm:text-2xl">Envases biodegradables</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
};

export default ShoppingCart;
