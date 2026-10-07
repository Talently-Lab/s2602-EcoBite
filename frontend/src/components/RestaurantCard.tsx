import { Carrot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
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
  description = "Lorem ipsum dolor sit amet, consectetur adipcitation ullamco laboris nisi ut aliquip ex ea commoddidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
  imageSrc = "/images/image-restaurant.png",
  imageAlt = "Interior del restaurante",
  tag = "Vegetariano",
  className,
  onView,
}: RestaurantCardProps) => {
  return (
    <Card
      className={cn(
        "w-full gap-0 overflow-hidden rounded-2xl bg-card border border-border py-0",
        className
      )}
    >
      <div className="relative h-38 w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
        />
      </div>

      <CardContent className="flex flex-col px-3.5 pt-5 pb-5 gap-0">
        <CardTitle className="text-lg font-extrabold tracking-tight text-foreground">
          {name}
        </CardTitle>

        <p className="text-xs leading-relaxed text-card-foreground/80 line-clamp-2">
          {description}
        </p>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-[10px] border border-border bg-muted px-3 py-2 mt-3 text-xs font-medium text-muted-foreground">
          <Carrot className="size-4" aria-hidden="true" />
          {tag}
        </span>
      </CardContent>

      <CardFooter className="px-3.5 pb-5">
        <Button
          type="button"
          onClick={onView}
          className="cursor-pointer rounded-[10px] w-full font-medium"
        >
          Ver restaurante
        </Button>
      </CardFooter>
    </Card>
  );
};
