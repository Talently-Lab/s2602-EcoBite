import { useId, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutSummary } from "@/components/CheckoutSummary";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/pages/layout/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useAuth";
import { useDeliveryZones } from "@/hooks/useCheckout";
import { ARGENTINA_MOBILE } from "@/lib/checkout-phone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const profile = useProfile();
  const zones = useDeliveryZones();
  const [editedZoneId, setEditedZoneId] = useState<string>();
  const destinationZoneId = editedZoneId ?? profile.data?.habitualZone?.id ?? "";
  const [editedAddress, setEditedAddress] = useState<string>();
  const direccion = editedAddress ?? profile.data?.address ?? "";
  const phoneCode = "+54";
  const [celular, setCelular] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [metodoPago, setMetodoPago] = useState<PaymentMethod | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const phoneRules = ARGENTINA_MOBILE;
  const phoneValid = new RegExp(`^(?:${phoneRules.pattern})$`).test(celular);
  const canContinue = Boolean(
    direccion.trim() && direccion.length <= 200 &&
    zones.data?.some((zone) => zone.id === destinationZoneId) &&
    /^\+[1-9][0-9]{0,2}$/.test(phoneCode) &&
    phoneValid && metodoPago
  );

  if (showSummary) {
    return (
      <MainLayout>
        <CheckoutSummary
          direccion={direccion}
          celular={`${phoneCode} ${celular}`}
          metodoPago={metodoPago}
          destinationZoneId={destinationZoneId}
          onBack={() => setShowSummary(false)}
          onPay={(receipt) => navigate("/voucher/1", { state: receipt })}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="relative mx-auto w-full max-w-140 py-2">
        <Link to="/cart" aria-label="Volver al carrito" title="Volver al carrito" className="mb-5 inline-flex size-11 items-center justify-center rounded-full text-[#00733d] hover:bg-[#e6fdef] focus-visible:outline-2 focus-visible:outline-offset-2 lg:absolute lg:top-0 lg:right-full lg:mr-6 lg:mb-0">
          <ArrowLeft aria-hidden="true" className="size-6" />
        </Link>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!event.currentTarget.reportValidity() || !canContinue) return;
            setEditedAddress(direccion.trim());
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
            <p className="mt-1 text-xs text-[#545454]">Todos los campos son obligatorios.</p>

            <label htmlFor="checkout-address" className="mt-3 block text-xs text-[#2C2C2A]">Dirección de entrega</label>
            <div className="mt-1.5 flex items-center gap-2.5">
              <Input
                id="checkout-address"
                type="text"
                aria-label="Dirección"
                autoComplete="street-address"
                placeholder="Dirección"
                value={direccion}
                required
                maxLength={200}
                pattern=".*\S.*"
                title="Ingresá la dirección de entrega."
                aria-describedby="checkout-address-help"
                onChange={(event) => setEditedAddress(event.target.value)}
                className="h-10 min-w-0 flex-1"
              />
            </div>
            <p id="checkout-address-help" role="status" className="mt-1 text-xs text-[#545454]">
              {profile.isFetching ? "Cargando tu dirección guardada…" : profile.isError ? "No pudimos cargar tu dirección guardada. Podés escribirla manualmente." : "Ingresá calle, número y, si corresponde, piso y departamento. Podés editar tu dirección guardada."}
            </p>

            <div className="mt-5">
              <label id="checkout-zone-label" className="block text-xs font-semibold text-[#000000]">Barrio de entrega (CABA)</label>
              <Select required name="destinationZoneId" items={(zones.data ?? []).map((zone) => ({ value: zone.id, label: zone.name }))} value={destinationZoneId || null} onValueChange={(value) => setEditedZoneId(value ?? "")}>
                <SelectTrigger aria-labelledby="checkout-zone-label" className="mt-1.5 h-10 w-full"><SelectValue placeholder="Elegí el barrio para estimar el impacto" /></SelectTrigger>
                <SelectContent>
                  {(zones.data ?? []).map((zone) => <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p role="status" className="mt-1 text-xs text-[#545454]">{zones.isError ? "No pudimos cargar los barrios de entrega." : "Usamos el barrio de entrega para estimar el ahorro de CO₂."}</p>
              {zones.isError && <button type="button" onClick={() => zones.refetch()} className="min-h-11 text-sm font-semibold text-[#00733d] underline">Reintentar</button>}
            </div>

            <label
              htmlFor="checkout-phone"
              className="mt-5 block text-xs font-semibold text-[#000000]"
            >
              Celular
            </label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <span className="flex h-10 shrink-0 items-center rounded-md border border-[#B5B5B5] bg-white px-3 text-sm text-[#2C2C2A]" aria-label="País del celular: Argentina, código +54">Argentina (+54)</span>
              <Input
                id="checkout-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Número sin código de país"
                value={celular}
                required
                pattern={phoneRules.pattern}
                maxLength={phoneRules.maxLength}
                title={phoneRules.help}
                aria-invalid={phoneTouched && !phoneValid ? true : undefined}
                aria-describedby={phoneTouched && !phoneValid ? "checkout-phone-help checkout-phone-error" : "checkout-phone-help"}
                onBlur={() => setPhoneTouched(true)}
                onInvalid={() => setPhoneTouched(true)}
                onChange={(event) => setCelular(event.target.value.replace(/\D/g, ""))}
                className="h-10 min-w-40 flex-1"
              />
            </div>
            <p id="checkout-phone-help" className="mt-1 text-xs text-[#545454]">{phoneRules.help}</p>
            {phoneTouched && !phoneValid && (
              <p id="checkout-phone-error" role="alert" className="mt-1 text-xs text-destructive">
                El celular debe tener 11 dígitos y empezar con 9. Por ejemplo: 91123456789, sin el +54.
              </p>
            )}
          </section>

          <section aria-labelledby="medio-pago" className="mt-9">
            <h2
              id="medio-pago"
              className="text-lg font-bold text-[#000000] sm:text-xl"
            >
              Escoge tu medio de pago
            </h2>

            <div
              role="radiogroup"
              aria-label="Medio de pago"
              aria-required="true"
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
                    required
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
              disabled={!canContinue}
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
