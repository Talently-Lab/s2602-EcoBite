import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RestaurantCardProps = {
  name?: string;
  description?: string;
  isEco?: boolean;
  featured?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  onView?: () => void;
};

export const RestaurantCard = ({
  name = "Nombre del Restaurante",
  description = "Comida saludable",
  isEco = false,
  featured = false,
  imageSrc = "/images/image-restaurant-02.webp",
  imageAlt = "Interior del restaurante",
  className,
  onView,
}: RestaurantCardProps) => {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 border border-[#E8E8E8]! bg-[#FFFFFF]!",
        featured && "min-h-[360px] rounded-2xl ring-0 shadow-sm",
        className
      )}
    >
      <CardContent className={cn("flex h-full flex-col items-start gap-0 px-3 py-3", featured && "p-4")}>
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-40 w-full object-cover rounded-[8px]"
        />
        {isEco && (
          <span className="mt-3 flex items-center gap-1 rounded-full bg-[#e6fdef] px-2 py-1 text-xs font-bold text-[#00733d]">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-white" />
            Sustentable
          </span>
        )}
        <CardTitle className={cn("mt-2 text-xl font-extrabold tracking-[0.010em] text-black", featured && "mt-3 text-[32px] leading-9")}>
          {name}
        </CardTitle>
        <p className={cn("mt-1.5 text-xs text-[#6B6B6B]", featured && "mt-3 text-sm")}>
          {description}
        </p>
        <Button
          type="button"
          onClick={onView}
          className={cn("ml-auto mt-3 rounded-lg bg-[#009951]! px-5 py-3 text-sm text-white!", featured && "h-10 font-bold")}
        >
          Ver restaurante
        </Button>
      </CardContent>
    </Card>
  );
};
