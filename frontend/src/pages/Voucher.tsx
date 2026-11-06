import { ArrowUp, Check, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/context/cart-store";
import { useNavigate } from "react-router-dom";

const RECEIPT_ROWS = [
  { label: "Restaurante", value: "Restaurante Sarcy Verde" },
  { label: "Fecha de pago", value: "1 de noviembre 2026" },
  { label: "Hora de pago", value: "15:50" },
  { label: "ID de la transacción", value: "e123GSEJ8YC" },
  { label: "CVU", value: "1234567891" },
  { label: "Concepto", value: "Producto 1" },
  { label: "Concepto", value: "Producto 2" },
  { label: "Concepto", value: "Producto 3" },
  { label: "Método de pago", value: "PSE" },
  { label: "Costo servicio", value: "$500" },
];

const IMPACT_BARS = [42, 58, 50, 72, 46, 65, 55, 80, 62, 70, 88, 100];

export default function Voucher() {
  const navigate = useNavigate()
  const clearCart = useCartStore((s) => s.clear)

  return (
    <main className="flex min-h-screen justify-center bg-[#FFFFFF] px-4 py-7 text-foreground">
      <div className="w-full max-w-85">
        <h1 className="text-lg text-center font-bold text-[#000000]">
          Simulación Realizada con éxito
        </h1>

        <img
          src="/images/Logo_Eb-circle-green.png"
          alt="EcoBite"
          width={96}
          height={96}
          className="mx-auto mt-8 size-24 object-contain"
        />

        <section className="mt-4 rounded-lg border border-[#E8E8E8] bg-white px-4 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
          <dl className="space-y-1.5 text-[11px]">
            {RECEIPT_ROWS.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className="flex justify-between gap-4"
              >
                <dt className="text-[#1B1B1B]">{row.label}</dt>
                <dd className="text-right text-[#8C8C8C]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2.5 flex justify-between gap-4 border-t border-[#D9D9D9] pt-2 text-[11px] font-semibold text-[#1B1B1B]">
            <span>Total</span>
            <span>$500</span>
          </div>
        </section>

        <section className="mt-4 rounded-lg bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
          <h2 className="text-sm font-bold text-[#000000]">
            Este pedido logró:
          </h2>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="space-y-2 text-[13px] text-[#2C2C2A]">
              <p>
                <span className="font-bold text-[#000000]">12,4 Kg</span> CO₂
                ahorrado
              </p>
              <p>Uso de envase biodegradable</p>
            </div>
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#04E762] text-[#003D29]">
              <Leaf className="size-7" fill="currentColor" aria-hidden="true" />
            </span>
          </div>
        </section>

        <section
          aria-labelledby="accumulated-impact"
          className="mt-4 rounded-lg bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="accumulated-impact"
                className="text-xs font-medium text-[#2C2C2A]"
              >
                Tu impacto acumulado
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#000000]">
                15,367
              </p>
            </div>
            <p className="flex items-center gap-0.5 text-[10px] font-semibold text-[#009951]">
              <ArrowUp
                className="size-2.5"
                strokeWidth={3}
                aria-hidden="true"
              />
              6.7% vs Nov 25
            </p>
          </div>
          <div
            className="mt-5 flex h-20 items-end justify-between gap-1.5"
            aria-hidden="true"
          >
            {IMPACT_BARS.map((height, index) => (
              <div
                key={index}
                className="relative h-full w-1.5 rounded-full bg-[#D7F5E3]"
              >
                <span
                  className="absolute inset-x-0 bottom-0 rounded-full bg-[#009951]"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 flex flex-col items-center gap-2">
          <Button
            type="button"
            size="xs"
            onClick={() => {
              clearCart();
              navigate("/catalog");
            }}
            className="text-xs p-4 bg-[#009951]! text-[#FFFFFF]!"
          >
            Finalizar
          </Button>
          <button
            type="button"
            className="cursor-pointer text-[10px] text-[#6B6B6B] underline-offset-2 hover:underline"
          >
            Descargar PDF
          </button>
        </div>

        <p className="mt-4 text-center text-base font-bold text-[#009951] sm:text-lg">
          ¡Gracias por ser parte del cambio!
        </p>

        <footer className="mt-8 flex flex-col items-center text-center">
          <span className="grid size-8 place-items-center rounded-full bg-[#003D29] text-white">
            <Check className="size-4.5" strokeWidth={3} aria-hidden="true" />
          </span>
          <p className="mt-2 text-sm font-bold text-[#1B1B1B]">
            Pedido en preparación
          </p>
          <p className="mt-1 text-[10px] text-[#545454]">
            Menores emisiones y menos residuos
          </p>
        </footer>
      </div>
    </main>
  );
}
