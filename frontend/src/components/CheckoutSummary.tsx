import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS = [
  { id: "agua-1", name: "Agua de Jamaica", price: 15000, quantity: "01" },
  { id: "agua-2", name: "Agua de Jamaica", price: 15000, quantity: "01" },
  { id: "agua-3", name: "Agua de Jamaica", price: 15000, quantity: "01" },
];

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
  direccion?: string;
  celular?: string;
  metodoPago?: string | null;
  onEdit: () => void;
  onPay?: () => void;
};

export const CheckoutSummary = ({
  direccion,
  celular,
  metodoPago,
  onEdit,
  onPay,
}: CheckoutSummaryProps) => {
  const paymentLabel =
    (metodoPago && PAYMENT_LABELS[metodoPago]) || "Tarjeta Débito";

  return (
    <div className="mx-auto w-full max-w-105 py-2">
      <section className="rounded-[10px] border border-[#E6E6E6] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h1 className="text-base font-bold text-[#000000]">
          Tu impacto ambiental estimado:
        </h1>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-[#2C2C2A]">12,4 Kg</p>
            <p className="text-sm text-[#2C2C2A]">CO₂ ahorrado</p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#04E762] text-[#003D29]">
            <Leaf className="size-6" fill="currentColor" aria-hidden="true" />
          </span>
        </div>
      </section>

      <ul className="mt-6 divide-y divide-[#E6E6E6] border-b border-[#E6E6E6]">
        {ITEMS.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <img
              src="/images/image-cart.png"
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
            <p className="shrink-0 text-right text-[10px] font-bold text-[#2C2C2A]">
              Subtotal <span className="text-[#000000]">{item.quantity}</span>
            </p>
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
            <dd>{formatPrice(45000)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Envío</dt>
            <dd>{formatPrice(1479)}</dd>
          </div>
        </dl>
        <div className="mt-2 flex justify-between gap-4 border-t border-[#B5B5B5] pt-2 text-sm font-bold text-[#000000]">
          <span>TOTAL</span>
          <span>{formatPrice(46479)}</span>
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
            <dt className="text-[#2C2C2A]">Nombre del titular</dt>
            <dd className="text-[#1B1B1B]">Juan Pérez</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#2C2C2A]">Número de tarjeta</dt>
            <dd className="text-[#1B1B1B]">**** 6789</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#2C2C2A]">Fecha de vencimiento</dt>
            <dd className="text-[#1B1B1B]">12/23</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#2C2C2A]">Total</dt>
            <dd className="text-[#1B1B1B]">{formatPrice(3000)}</dd>
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
            {direccion?.trim() || "Cabildo 200 CABA"}
          </span>
          <span className="font-semibold text-[#2C2C2A]">Celular</span>
          <span className="text-[#1B1B1B]">
            {celular?.trim() || "54 11 5555 5555"}
          </span>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-center gap-5 pb-4">
        <Button
          type="button"
          size="sm"
          onClick={onEdit}
          className="min-w-24 bg-[#009951]! text-[#FFFFFF]!"
        >
          Editar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onPay}
          className="min-w-24 bg-[#009951]! text-[#FFFFFF]!"
        >
          Ir a pagar
        </Button>
      </div>
    </div>
  );
};
