import { useState } from "react";
import { Bike, Leaf, Minus, Plus, Recycle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/pages/layout/MainLayout";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/types/cart";

const INITIAL_ITEMS: CartItem[] = [
  {
    id: "jamaica-1",
    name: "Agua de Jamaica",
    price: 15000,
    quantity: 1,
    image: "/images/image-cart.png",
  },
  {
    id: "jamaica-2",
    name: "Agua de Jamaica",
    price: 15000,
    quantity: 1,
    image: "/images/image-cart.png",
  },
  {
    id: "jamaica-3",
    name: "Agua de Jamaica",
    price: 15000,
    quantity: 1,
    image: "/images/image-cart.png",
  },
];

const DELIVERY_OPTIONS = [
  { id: "delivery", label: "Delivery" },
  { id: "pickup", label: "Retiro en local" },
] as const;

type DeliveryMode = (typeof DELIVERY_OPTIONS)[number]["id"];

const formatCo2 = (kg: number) =>
  new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(kg);

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatQuantity = (quantity: number) => String(quantity).padStart(2, "0");

const ShoppingCart = () => {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");

  const increment = (id: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

  const decrement = (id: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <MainLayout>
      <section aria-labelledby="impact-heading" className="my-3">
        <Card className="px-4 py-5 rounded-[16px] bg-[#FFFFFF] border border-[#E8E8E8]!">
          <CardContent className="flex flex-row justify-between items-end gap-4 px-0">
            <div className="min-w-0">
              <h2
                id="impact-heading"
                className="text-xl font-bold leading-snug text-[#000000]"
              >
                Tu impacto ambiental
              </h2>
              <div className="flex flex-col gap-4 mt-4">
                <p className="mt-4 text-base text-[#000000]">
                  {formatCo2(12.4)} Kg
                </p>
                <p className="text-sm text-[#000000]">
                  CO₂ ahorrado
                </p>
                <p className="text-sm text-[#000000]">
                  ¡Gracias por ser parte del cambio!
                </p>
              </div>
            </div>
            <span
              aria-hidden="true"
              className="grid size-18 shrink-0 place-items-center rounded-full bg-[#04E762] text-[#003D29] sm:size-16"
            >
              <Leaf className="size-5" fill="currentColor" />
            </span>
          </CardContent>
        </Card>
      </section>
      <section
        aria-label="Detalle del pedido"
        className="my-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
      >
        <div className="min-w-0">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#545454] dark:text-neutral-300">
              Tu carrito está vacío.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 border-b border-[#8A8A8A]/50 py-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                    className="size-16 shrink-0 rounded-lg object-cover sm:size-18"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#000000] sm:text-base">
                      {item.name}
                    </p>
                    <p className="mt-1 text-base font-bold text-[#003D29] sm:text-lg">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => decrement(item.id)}
                      disabled={item.quantity <= 1}
                      aria-label={`Quitar una unidad de ${item.name}`}
                      className="grid size-8 place-items-center rounded-full border border-[#009951] text-[#009951] transition-colors hover:bg-[#009951]/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-[#1B1B1B] tabular-nums">
                      {formatQuantity(item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => increment(item.id)}
                      aria-label={`Agregar una unidad de ${item.name}`}
                      className="grid size-8 place-items-center rounded-full bg-[#009951] text-white transition-colors hover:bg-[#003D29]"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Eliminar ${item.name} del carrito`}
                      className="ml-1 grid size-8 place-items-center rounded-full text-[#009951] transition-colors hover:bg-[#009951]/10"
                    >
                      <Trash2 className="size-4.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Modo de entrega */}
          <div
            role="group"
            aria-label="Modo de entrega"
            className="mt-6 flex overflow-hidden rounded-full border-2 border-[#009951]"
          >
            {DELIVERY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={deliveryMode === option.id}
                onClick={() => setDeliveryMode(option.id)}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-bold transition-colors sm:text-base cursor-pointer",
                  deliveryMode === option.id
                    ? "bg-[#009951] text-white"
                    : "bg-white text-[#5F6265] hover:bg-[#009951]/10"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="border-y border-[#B5B5B5] py-3 mt-6">
            <p className="text-[#2C2C2A] font-bold text-lg sm:text-xl">Resumen</p>
            <div className="text-[#2C2C2A] mt-3 space-y-1.5">
              <div className="flex justify-between">
                <p>Productos</p>
                <p>$18.535</p>
              </div>
              <div className="flex justify-between">
                <p>Envío</p>
                <p>$1.479</p>
              </div>
            </div>
          </div>
          <div className="text-[#2C2C2A] font-bold flex justify-between mt-3">
            <p>TOTAL</p>
            <p>$20.014</p>
          </div>
          <Button className="w-full bg-[#009951]! text-[#FFFFFF]! rounded-[8px]! mt-8 py-5">
            Ir a Pagar
          </Button>
        </div>

        {/* Resumen del pedido */}
        <Card className="py-0 h-fit rounded-[16px] bg-[#FFFFFF] border border-[#E8E8E8]!">
          <CardContent className="px-6 py-6">
            <h2 className="text-xl font-bold leading-snug text-balance text-[#000000] sm:text-2xl">
              Confirmá tu pedido y conocé su impacto estimado.
            </h2>
            <ul className="mt-5 space-y-4">
              <li className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0B0B0B] text-[#04E762]"
                >
                  <Recycle className="size-4.5" />
                </span>
                <p className="text-lg text-[#000000]">
                  Ahorro acumulado de <strong className="font-bold">Co2</strong>
                </p>
              </li>
              <li className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#04E762] text-[#003D29]"
                >
                  <Leaf className="size-4.5" fill="currentColor" />
                </span>
                <p className="text-lg text-[#000000]">
                  Envases biodegradables
                </p>
              </li>
              <li className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#04E762] text-[#003D29]"
                >
                  <Bike className="size-4.5" />
                </span>
                <p className="text-lg text-[#000000]">
                  Entregas sin emisiones
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  );
};

export default ShoppingCart;
