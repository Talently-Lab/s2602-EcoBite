import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoucherReceipt } from "@/components/VoucherReceipt";
import { useCartStore } from "@/context/cart-store";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { voucherSchema } from "@/schemas/voucher.schema";
import "./Voucher.css";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);

export default function Voucher() {
  const navigate = useNavigate();
  const clearCart = useCartStore((s) => s.clear);
  const { state } = useLocation();
  const result = voucherSchema.safeParse(state);

  if (!result.success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center text-[#2C2C2A]">
        <h1 className="text-xl font-bold">No hay datos del comprobante</h1>
        <p>Completá el checkout para ver el comprobante de tu pedido.</p>
        <Link to="/catalog" className="min-h-11 rounded-sm font-semibold text-[#00733d] underline focus-visible:outline-2 focus-visible:outline-offset-2">Volver a restaurantes</Link>
      </main>
    );
  }

  const receipt = result.data;
  const paidAt = new Date(receipt.paidAt);
  const total = receipt.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const restaurantNames = [...new Set(receipt.items.map((item) => item.restaurantName).filter(Boolean))];
  const rows = [
    { label: "Restaurante", value: restaurantNames.join(", ") || "No disponible" },
    { label: "Cliente", value: receipt.customerName || "No disponible" },
    { label: "Fecha de pago", value: paidAt.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) },
    { label: "Hora de pago", value: paidAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }) },
    // shortcut: la API no devuelve un ID de pago; reemplazar al integrar las transacciones de pago.
    { label: "ID de la transacción", value: "e123GSEJ8YC" },
    ...receipt.items.map((item) => ({ label: `${item.quantity} × ${item.name}`, value: formatPrice(item.price * item.quantity) })),
    { label: "Método de pago", value: receipt.paymentLabel },
    { label: "Dirección", value: receipt.address },
    { label: "Barrio", value: receipt.zoneName || "No disponible" },
    { label: "Celular", value: receipt.phone },
  ];

  return (
    <main className="voucher-page flex min-h-screen justify-center bg-[#FFFFFF] px-4 py-7 text-foreground">
      <div className="voucher-screen-only w-full max-w-85">
        <h1 className="text-lg text-center font-bold text-[#000000]">Pedido Realizado con éxito</h1>
        <img src="/images/Logo_Eb-circle-green.png" alt="EcoBite" width={96} height={96} className="mx-auto mt-8 size-24 object-contain" />
        <section className="mt-4 rounded-lg border border-[#E8E8E8] bg-white px-4 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
          <dl className="space-y-1.5 text-[11px]">
            {rows.map((row, index) => (
              <div key={`${row.label}-${index}`} className="flex justify-between gap-4">
                <dt className="min-w-0 break-words text-[#1B1B1B]">{row.label}</dt>
                <dd className="min-w-0 break-words text-right text-[#545454]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2.5 flex justify-between gap-4 border-t border-[#D9D9D9] pt-2 text-[11px] font-semibold text-[#1B1B1B]">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
        </section>
        <div className="mt-4 flex flex-col items-center gap-2">
          <Button type="button" size="xs" onClick={() => { clearCart(); navigate("/catalog"); }} className="text-xs p-4 bg-[#009951]! text-[#FFFFFF]!">Finalizar</Button>
          <button type="button" onClick={() => window.print()} className="cursor-pointer text-[10px] text-[#6B6B6B] underline-offset-2 hover:underline">Descargar PDF</button>
        </div>
        <p className="mt-4 text-center text-base font-bold text-[#009951] sm:text-lg">¡Gracias por ser parte del cambio!</p>
        <footer className="mt-8 flex flex-col items-center text-center">
          <span className="grid size-8 place-items-center rounded-full bg-[#003D29] text-white"><Check className="size-4.5" strokeWidth={3} aria-hidden="true" /></span>
          <p className="mt-2 text-sm font-bold text-[#1B1B1B]">Pedido en preparación</p>
          <p className="mt-1 text-[10px] text-[#545454]">Menores emisiones y menos residuos</p>
        </footer>
      </div>
      <div className="voucher-print-only"><VoucherReceipt receipt={receipt} /></div>
    </main>
  );
}
