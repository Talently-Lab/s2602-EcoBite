import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/context/cart-store";
import type { RestaurantProduct } from "@/types/restaurant";

type ItemProps = RestaurantProduct & {
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  tag?: string;
  layout?: "vertical" | "horizontal";
  className?: string;
};

export const Item = ({ ...product }: ItemProps) => {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.imageSrc ?? "/images/image-dish.png",
    });
  };

  const cardClassName = cn(
    "gap-0 overflow-hidden py-0 border border-[#E8E8E8]! bg-[#FFFFFF]!",
    product.className
  );

  if (product.layout === "horizontal") {
    return (
      <Card className={cardClassName}>
        <CardContent className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <img
              src={'/images/image-dish.png'}
              alt={'Bowl saludable con garbanzos, palta y vegetales frescos'}
              loading="lazy"
              className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <CardTitle className="text-[#000000] text-base font-extrabold tracking-[0.010em] sm:text-lg">
                {product.name}
              </CardTitle>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                {product.description}
              </p>
              <span className="mt-2 text-base font-extrabold text-[#009951]">
                $ {product.price}
              </span>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-3 text-sm rounded-[8px] bg-[#009951]! text-[#FFFFFF]! sm:w-auto sm:shrink-0 sm:px-5"
          >
            Agregar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardContent className="flex-1 flex flex-col items-start gap-0 px-3 py-3">
        <img
          src={'/images/image-dish.png'}
          alt={'Bowl saludable con garbanzos, palta y vegetales frescos'}
          loading="lazy"
          className="h-44 w-full object-cover rounded-[8px]"
        />
        <span className="flex items-center gap-1 rounded-full bg-[#E6FDEF] text-[#009951] px-2 py-1 text-[11px] font-bold mt-3">
          <span className="h-2 w-2 rounded-full bg-[#FFFFFFCC] block" />
          {product.tag}
        </span>
        <CardTitle className="text-[#000000] text-lg md:text-xl font-extrabold tracking-[0.010em]">
          {product.name}
        </CardTitle>
        <p className="my-1.5 text-xs text-[#6B6B6B]">
          {product.description || "Sin descripción"}
        </p>
        <div className="mt-auto flex w-full items-center justify-between gap-3">
          <span className="text-lg font-extrabold text-[#2C2C2A]">
            $ {product.price}
          </span>
          <Button
            type="button"
            onClick={handleAddToCart}
            className="px-5 py-3 text-sm rounded-[8px] bg-[#009951]! text-[#FFFFFF]!"
          >
            Agregar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
