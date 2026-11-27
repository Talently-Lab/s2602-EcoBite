import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/context/cart-store";
import type { RestaurantProduct } from "@/types/restaurant";

type ItemProps = RestaurantProduct & {
  restaurantName: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  tag?: string;
  layout?: "vertical" | "horizontal";
  className?: string;
};

const priceFormat = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export const Item = ({ ...product }: ItemProps) => {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!product.available) return;
    addItem({
      productId: product.id,
      restaurantName: product.restaurantName,
      name: product.name,
      price: product.price,
      image: product.imageSrc ?? "/images/image-dish.png",
    });
  };

  const cardClassName = cn(
    "gap-0 overflow-hidden rounded-2xl border border-[#e8e8e8]! bg-white! py-0 ring-0 shadow-sm",
    product.className
  );

  if (product.layout === "horizontal") {
    return (
      <Card className={cardClassName}>
        <CardContent className="flex min-h-[174px] flex-col justify-center gap-4 p-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <img
              src={product.imageSrc ?? "/images/image-dish.png"}
              alt={product.imageAlt ?? `Imagen ilustrativa de ${product.name}`}
              loading="lazy"
              className="size-20 shrink-0 rounded-lg object-cover sm:size-22"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <CardTitle className="text-xl font-bold leading-6 text-[#2c2c2a]">
                {product.name}
              </CardTitle>
              {product.description && <p className="mt-1 text-sm text-[#6b6b6b]">{product.description}</p>}
              <span className="mt-3 text-sm font-bold text-[#00733d]">
                {priceFormat.format(product.price)}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.available}
            className="h-10 w-full rounded-lg bg-[#009951]! text-sm font-bold text-white! sm:w-auto sm:shrink-0 sm:px-6"
          >
            {product.available ? "Agregar" : "No disponible"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardContent className="flex flex-1 flex-col items-start gap-0 p-4">
        <img
          src={product.imageSrc ?? "/images/image-dish.png"}
          alt={product.imageAlt ?? `Imagen ilustrativa de ${product.name}`}
          loading="lazy"
          className="h-44 w-full object-cover rounded-[8px]"
        />
        {product.tag && <span className="mt-3 rounded-full bg-[#ffdbb2] px-2 py-1 text-sm font-bold text-black">{product.tag}</span>}
        <CardTitle className="mt-3 text-xl font-bold leading-6 text-black">
          {product.name}
        </CardTitle>
        {product.description && <p className="mt-3 mb-4 text-sm leading-5 text-[#6b6b6b]">{product.description}</p>}
        <div className="mt-auto flex w-full items-center justify-between gap-3 pt-4">
          <span className="text-sm font-bold text-[#00733d]">
            {priceFormat.format(product.price)}
          </span>
          <Button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.available}
            className="h-10 rounded-lg bg-[#009951]! px-6 text-sm font-bold text-white!"
          >
            {product.available ? "Agregar" : "No disponible"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
