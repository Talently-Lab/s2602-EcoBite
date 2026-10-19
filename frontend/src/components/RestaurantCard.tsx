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
  imageSrc = "/images/image-restaurant.png",
  imageAlt = "Interior del restaurante",
  tag = "Eco friendly",
  className,
  onView,
}: RestaurantCardProps) => {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 border-[#E8E8E8]",
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
        <span className="flex items-center gap-1 rounded-full bg-border px-2 py-1 text-[11px] font-bold text-ring mt-3">
          <span className="h-2 w-2 rounded-full bg-popover block"/>
          {tag}
        </span>
        <CardTitle className="text-xl font-extrabold tracking-[0.010em]">
          {name}
        </CardTitle>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {description}
        </p>
        <Button
          type="button"
          onClick={onView}
          className="ml-auto mt-3 px-5 py-3 text-sm rounded-[8px]"
        >
          Ver restaurante
        </Button>
      </CardContent>
    </Card>
  );
};
