import type { VoucherData } from "@/schemas/voucher.schema";

const formatPrice = (amount: number) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0,
}).format(amount);

export function VoucherReceipt({ receipt }: { receipt: VoucherData }) {
  const paidAt = new Date(receipt.paidAt);
  const total = receipt.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const restaurants = [...new Set(receipt.items.map((item) => item.restaurantName).filter(Boolean))];

  return (
    <article className="voucher-receipt" aria-labelledby="receipt-title">
      <header className="receipt-header">
        <div className="receipt-brand">
          <img src="/images/Logo_Eb-circle-green.png" alt="" width={48} height={48} />
          <span>ecobite</span>
        </div>
        <div className="receipt-date">
          <p>{paidAt.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
          <p>{paidAt.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} h</p>
        </div>
      </header>
      <div className="receipt-heading">
        <h2 id="receipt-title">Comprobante de pedido</h2>
        {/* shortcut: la API no devuelve un ID de pago; reemplazar al integrar las transacciones de pago. */}
        <p>ID de la transacción · e123GSEJ8YC</p>
      </div>
      <div className="receipt-details">
        <section>
          <h3>Restaurante</h3>
          <p className="receipt-strong">{restaurants.join(", ") || "No disponible"}</p>
          <h3>Cliente</h3>
          <p>{receipt.customerName || "No disponible"}</p>
          <p>{receipt.phone}</p>
        </section>
        <section>
          <h3>Datos de entrega</h3>
          <p>{receipt.address}</p>
          <p>{receipt.zoneName || "No disponible"}</p>
        </section>
      </div>
      <table className="receipt-products">
        <caption>Detalle del pedido</caption>
        <colgroup><col className="receipt-quantity" /><col /><col className="receipt-price" /><col className="receipt-price" /></colgroup>
        <thead>
          <tr><th scope="col">Cant.</th><th scope="col">Producto</th><th scope="col">P. unitario</th><th scope="col">Subtotal</th></tr>
        </thead>
        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.productId}>
              <td>{item.quantity}</td><td>{item.name}</td><td>{formatPrice(item.price)}</td><td>{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer className="receipt-footer">
        <div className="receipt-total"><span>Total del pedido</span><strong>{formatPrice(total)}</strong></div>
        <div className="receipt-payment">
          <div><h3>Medio de pago</h3><p>{receipt.paymentLabel}</p></div>
          <p className="receipt-status">Pedido en preparación</p>
        </div>
        <p className="receipt-thanks">¡Gracias por ser parte del cambio!</p>
        <p className="receipt-tagline">Menores emisiones y menos residuos.</p>
      </footer>
    </article>
  );
}
