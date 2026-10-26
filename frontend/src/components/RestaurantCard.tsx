import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RestaurantCardProps = {
  name?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  tag?: string;
  className?: string;
  onView?: () => void;
};

export const RestaurantCard = ({
  name = "Nombre del Restaurante",
  description = "Comida saludable",
  imageSrc = "/images/image-restaurant-02.png",
  imageAlt = "Interior del restaurante",
  tag = "Eco friendly",
  className,
  onView,
}: RestaurantCardProps) => {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 border border-[#E8E8E8]! bg-[#FFFFFF]!",
        className
      )}
    >
      <CardContent className="flex flex-col items-start gap-0 px-3 py-3">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-40 w-full object-cover rounded-[8px]"
        />
        <span className="flex items-center gap-1 rounded-full bg-[#E6FDEF] text-[#009951] px-2 py-1 text-[11px] font-bold mt-3">
          <span className="h-2 w-2 rounded-full bg-[#FFFFFFCC] block"/>
          {tag}
        </span>
        <CardTitle className="text-[#000000] text-xl font-extrabold tracking-[0.010em]">
          {name}
        </CardTitle>
        <p className="mt-1.5 text-xs text-[#6B6B6B]">
          {description}
        </p>
        <Button
          type="button"
          onClick={onView}
          className="ml-auto mt-3 px-5 py-3 text-sm rounded-[8px] bg-[#009951]! text-[#FFFFFF]!"
        >
          Ver restaurante
        </Button>
      </CardContent>
    </Card>
  );
};
