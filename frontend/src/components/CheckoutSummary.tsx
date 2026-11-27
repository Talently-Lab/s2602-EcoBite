import { ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/context/cart-store";
import { useAuthStore } from "@/context/auth-store";
import { useProfile } from "@/hooks/useAuth";
import { useDeliveryZones } from "@/hooks/useCheckout";
import type { VoucherData } from "@/schemas/voucher.schema";

const PAYMENT_LABELS: Record<string, string> = {
  debito: "Tarjeta Débito",
  credito: "Tarjeta Crédito",
  "nueva-tarjeta": "Tarjeta Débito/Crédito",
  paypal: "PayPal",
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

type CheckoutSummaryProps = {
  direccion: string;
  celular: string;
  metodoPago?: string | null;
  destinationZoneId: string;
  onBack: () => void;
  onPay?: (receipt: VoucherData) => void;
};

export const CheckoutSummary = ({
  direccion,
  celular,
  metodoPago,
  destinationZoneId,
  onBack,
  onPay,
}: CheckoutSummaryProps) => {
  const items = useCartStore((s) => s.items);
  const sessionName = useAuthStore((s) => s.session?.user.name);
  const profile = useProfile();
  const zones = useDeliveryZones();
  const destinationZone = zones.data?.find((zone) => zone.id === destinationZoneId);
  // shortcut: usa la distancia promedio del barrio; reemplazar cuando la API permita cotizar el trayecto sin crear un pedido.
  const co2SavedKg = destinationZone ? Math.round(destinationZone.distanceKm * 0.08 * 1000) / 1000 : undefined;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paymentLabel =
    (metodoPago && PAYMENT_LABELS[metodoPago]) || "No seleccionado";

  return (
    <div className="relative mx-auto w-full max-w-105 py-2">
      <button type="button" onClick={onBack} aria-label="Volver a los datos de envío y pago" title="Volver al paso anterior" className="mb-5 inline-flex size-11 items-center justify-center rounded-full text-[#00733d] hover:bg-[#e6fdef] focus-visible:outline-2 focus-visible:outline-offset-2 lg:absolute lg:top-0 lg:right-full lg:mr-6 lg:mb-0">
        <ArrowLeft aria-hidden="true" className="size-6" />
      </button>
      <section className="rounded-[10px] border border-[#E6E6E6] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h1 className="text-base font-bold text-[#000000]">
          Tu impacto ambiental estimado:
        </h1>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p role="status" className="text-sm text-[#2C2C2A]">
              {!destinationZoneId ? "Elegí el barrio de entrega en el paso anterior." : zones.isError ? "No pudimos estimar el impacto de la entrega." : zones.isPending ? "Calculando…" : co2SavedKg === undefined ? "El barrio seleccionado no está disponible." : `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 3 }).format(co2SavedKg)} kg`}
            </p>
            <p className="text-sm text-[#2C2C2A]">CO₂ ahorrado</p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#04E762] text-[#003D29]">
            <Leaf className="size-6" fill="currentColor" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-2 text-xs text-[#545454]">Estimación orientativa según la distancia promedio del barrio de entrega. Puede variar al confirmar el pedido.</p>
      </section>

      <ul className="mt-6 divide-y divide-[#E6E6E6] border-b border-[#E6E6E6]">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3 py-3">
            <img
              src={item.image}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-[#2C2C2A]">
                {item.name}
              </p>
              <p className="mt-1 text-sm font-bold text-[#003D29]">
                {formatPrice(item.price)}
              </p>
            </div>
            <div className="shrink-0 text-right text-[10px] text-[#2C2C2A]">
              <p>Cantidad: {item.quantity}</p>
              <p className="mt-1 font-bold text-[#000000]">Subtotal {formatPrice(item.price * item.quantity)}</p>
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="checkout-summary-total" className="mt-6">
        <h2
          id="checkout-summary-total"
          className="text-sm font-bold text-[#000000]"
        >
          Resumen
        </h2>
        <dl className="mt-2 space-y-1 text-[11px] text-[#2C2C2A]">
          <div className="flex justify-between gap-4">
            <dt>Productos</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <div className="mt-2 flex justify-between gap-4 border-t border-[#B5B5B5] pt-2 text-sm font-bold text-[#000000]">
          <span>TOTAL</span>
          <span>{formatPrice(total)}</span>
        </div>
      </section>

      <section aria-labelledby="checkout-summary-payment" className="mt-6">
        <h2
          id="checkout-summary-payment"
          className="text-sm font-bold text-[#000000]"
        >
          Medio de pago seleccionado
        </h2>
        <p className="mt-1 text-[10px] font-bold text-[#2C2C2A]">
          {paymentLabel}
        </p>
        <dl className="mt-3 space-y-1.5 text-[11px]">
          <div className="flex justify-between gap-4">
            <dt className="text-[#2C2C2A]">Nombre de usuario</dt>
            <dd className="text-[#1B1B1B]">{profile.data?.name ?? sessionName ?? "No disponible"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#2C2C2A]">Número de tarjeta</dt>
            <dd className="text-[#1B1B1B]">**** 6789</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#2C2C2A]">Total</dt>
            <dd className="text-[#1B1B1B]">{formatPrice(total)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="checkout-summary-address" className="mt-6">
        <h2
          id="checkout-summary-address"
          className="text-sm font-bold text-[#000000]"
        >
          Datos envío
        </h2>
        <div className="mt-2 grid grid-cols-[84px_1fr] gap-x-3 gap-y-1 text-[11px]">
          <span className="font-semibold text-[#2C2C2A]">Dirección</span>
          <span className="text-[#1B1B1B]">
            {direccion}
          </span>
          <span className="font-semibold text-[#2C2C2A]">Celular</span>
          <span className="text-[#1B1B1B]">
            {celular}
          </span>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-center gap-5 pb-4">
        <Button
          type="button"
          size="sm"
          onClick={() => onPay?.({
            paidAt: new Date().toISOString(),
            items,
            address: direccion,
            phone: celular,
            zoneName: destinationZone?.name ?? "",
            customerName: profile.data?.name ?? sessionName ?? "",
            paymentLabel,
          })}
          disabled={items.length === 0}
          className="min-w-24 bg-[#009951]! text-[#FFFFFF]!"
        >
          Ir a pagar
        </Button>
      </div>
    </div>
  );
};
