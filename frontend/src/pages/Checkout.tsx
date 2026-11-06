import { useId, useState } from "react";
import { BadgeCheck, BookUser, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutSummary } from "@/components/CheckoutSummary";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/pages/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const PAYMENT_METHODS = [
  { id: "debito", title: "Débito", subtitle: "****6789", brands: true },
  { id: "credito", title: "Crédito", subtitle: "****6789", brands: true },
  {
    id: "nueva-tarjeta",
    title: "Agregar Tarjeta Débito/Crédito",
    subtitle: "****6789",
    brands: true,
  },
  { id: "paypal", title: "PayPal", subtitle: null, brands: false },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];

const FieldIcons = () => (
  <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
    {[BookUser, CreditCard, BadgeCheck].map((Icon, index) => (
      <span
        key={index}
        className="grid size-4 place-items-center rounded-[3px] bg-[#009951] text-white"
      >
        <Icon className="size-2.5" strokeWidth={2.5} />
      </span>
    ))}
  </div>
);

const CardBrands = () => {
  const clipId = `mc-${useId().replace(/:/g, "")}`;

  return (
    <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
      <svg viewBox="0 0 32 20" className="h-4 w-auto">
        <defs>
          <clipPath id={clipId}>
            <circle cx="20" cy="10" r="9" />
          </clipPath>
        </defs>
        <circle cx="12" cy="10" r="9" fill="#EB001B" />
        <circle cx="20" cy="10" r="9" fill="#F79E1B" />
        <g clipPath={`url(#${clipId})`}>
          <circle cx="12" cy="10" r="9" fill="#FF5F00" />
        </g>
      </svg>
      <span className="text-[11px] font-extrabold italic leading-none tracking-tight text-[#1A1F71]">
        VISA
      </span>
      <span className="grid h-4 w-6 place-items-center rounded-xs bg-[#006FCF] text-[6px] font-bold leading-none text-white">
        AMEX
      </span>
    </span>
  );
};

const PayPalLogo = () => (
  <span className="flex items-baseline text-lg font-extrabold italic leading-none tracking-tight">
    <span className="text-[#253B80]">Pay</span>
    <span className="text-[#179BD7]">Pal</span>
  </span>
);

export default function Checkout() {
  const navigate = useNavigate()
  const [direccion, setDireccion] = useState("");
  const [celular, setCelular] = useState("");
  const [metodoPago, setMetodoPago] = useState<PaymentMethod | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  if (showSummary) {
    return (
      <MainLayout>
        <CheckoutSummary
          direccion={direccion}
          celular={celular}
          metodoPago={metodoPago}
          onEdit={() => setShowSummary(false)}
          onPay={() => navigate(`/voucher/${1}`)}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-140 py-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setShowSummary(true);
          }}
        >
          <section aria-labelledby="datos-envio">
            <h1
              id="datos-envio"
              className="text-lg font-bold text-[#000000] sm:text-xl"
            >
              Datos envío
            </h1>

            <p className="mt-3 text-xs text-[#2C2C2A]">
              Agrega tu dirección para el envío
            </p>
            <div className="mt-1.5 flex items-center gap-2.5">
              <Input
                id="checkout-address"
                type="text"
                aria-label="Dirección"
                autoComplete="street-address"
                placeholder="Dirección"
                value={direccion}
                disabled
                onChange={(event) => setDireccion(event.target.value)}
                className="h-10 min-w-0 flex-1"
              />
              <FieldIcons />
            </div>
            <p className="mt-1 text-[11px] text-[#8C8C8C]">Texto de ayuda</p>

            <label
              htmlFor="checkout-phone"
              className="mt-5 block text-xs font-semibold text-[#000000]"
            >
              Celular
            </label>
            <div className="mt-1.5 flex items-center gap-2.5">
              <Input
                id="checkout-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+54 9 11 5555 5555"
                value={celular}
                disabled
                onChange={(event) => setCelular(event.target.value)}
                className="h-10 min-w-0 flex-1"
              />
              <FieldIcons />
            </div>
            <p className="mt-1 text-[11px] text-[#8C8C8C]">Texto de ayuda</p>
          </section>

          <section aria-labelledby="medio-pago" className="mt-9">
            <h2
              id="medio-pago"
              className="text-lg font-bold text-[#000000] sm:text-xl"
            >
              Escoge tu medio de pago
            </h2>
            <p className="mt-1 text-xs font-semibold text-[#000000]">
              Simulación de pago
            </p>

            <div
              role="radiogroup"
              aria-label="Medio de pago"
              className="mt-4 space-y-4"
            >
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-md border-2 px-4 py-3.5 transition-colors focus-within:ring-2 focus-within:ring-[#009951]/40",
                    metodoPago === method.id
                      ? "border-[#009951] bg-[#F1F1F1]"
                      : "border-transparent bg-[#F1F1F1] hover:bg-[#EAEAEA]"
                  )}
                >
                  <input
                    type="radio"
                    name="metodo-pago"
                    value={method.id}
                    checked={metodoPago === method.id}
                    onChange={() => setMetodoPago(method.id)}
                    className="sr-only"
                  />

                  {method.id === "paypal" ? (
                    <PayPalLogo />
                  ) : (
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[#1B1B1B]">
                        {method.title}
                      </span>
                      <span className="block text-xs text-[#8C8C8C]">
                        {method.subtitle}
                      </span>
                    </span>
                  )}

                  {method.brands ? <CardBrands /> : null}
                </label>
              ))}
            </div>
          </section>

          <div className="mt-10 flex justify-center">
            <Button
              type="submit"
              size="sm"
              className="w-full py-5 bg-[#009951]! px-4 text-[#FFFFFF]!"
            >
              Continuar
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
