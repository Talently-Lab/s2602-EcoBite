import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { MainLayout } from "@/pages/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Item } from "@/components/Item";
import { useRestaurantById } from "@/hooks/useRestaurants";

const categoryDescriptions: Record<string, string> = {
  "Bowls y ensaladas": "Color, frescura y buenos ingredientes en cada bocado.",
  "Platos principales": "Recetas para disfrutar sin apuro.",
  "Para acompañar": "Un extra para completar tu plato.",
  Postres: "Un final dulce, hecho simple.",
  Bebidas: "Frescas para acompañar lo que elijas.",
};
const categoryOrder = Object.keys(categoryDescriptions);

const RestaurantDetail = () => {
  const { id } = useParams();
  const { restaurant, loading, error, refetch } = useRestaurantById(id ?? "");
  const [activeCategory, setActiveCategory] = useState(0);
  const categories = Array.from(new Set(restaurant?.products.map((product) => product.category))).sort(
    (a, b) => (categoryOrder.indexOf(a) < 0 ? 99 : categoryOrder.indexOf(a)) - (categoryOrder.indexOf(b) < 0 ? 99 : categoryOrder.indexOf(b)),
  );

  if (loading) return <MainLayout spacious><p role="status" className="py-16 text-[#545454]">Cargando restaurante…</p></MainLayout>;
  if (error || !restaurant) return (
    <MainLayout spacious>
      <div role="alert" className="space-y-4 py-16 text-[#2c2c2a]">
        <p>{error?.message ?? "Restaurante no encontrado."}</p>
        <Button type="button" onClick={() => refetch()}>Reintentar</Button>
        <Link to="/catalog" className="ml-4 underline">Volver a restaurantes</Link>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout spacious>
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-sm text-[#6b6b6b]">
        <Link to="/catalog" className="hover:text-[#00733d] hover:underline">Restaurantes</Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span aria-current="page" className="font-semibold text-[#2c2c2a]">{restaurant.name}</span>
      </nav>

      <section className="mt-6 grid items-stretch gap-6 bg-white md:grid-cols-2 md:gap-8">
        <img src="/images/image-restaurant-03.webp" alt="Imagen ilustrativa del restaurante" fetchPriority="high" className="h-64 w-full rounded-xl object-cover md:h-[290px]" />
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-black lg:text-5xl">{restaurant.name}</h1>
          <p className="mt-3 text-xl text-[#777]">{restaurant.category}</p>
          <p className="mt-6 text-xl leading-6 text-[#2c2c2a]">Elegí tu próximo plato: bowls frescos, recetas de estación y algo dulce para terminar.</p>
          {restaurant.isEco && (
            <span className="mt-9 flex w-fit items-center gap-1 rounded-full bg-[#e6fdef] px-2 py-1 text-xs font-bold text-[#00733d]">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-white" />Sustentable
            </span>
          )}
        </div>
      </section>

      <section aria-labelledby="restaurant-menu" className="mt-8">
        <h2 id="restaurant-menu" className="text-[32px] font-bold leading-10 text-[#2c2c2a]">Menú de {restaurant.name}</h2>
        {categories.length > 0 ? (
          <>
            <nav aria-label="Categorías del menú" className="mt-8 flex gap-3 overflow-x-auto border-b border-[#b5b5b5] pb-8">
              {categories.map((category, index) => (
                <a key={category} href={`#menu-category-${index}`} aria-current={activeCategory === index ? "location" : undefined} onClick={() => setActiveCategory(index)} className={cn("shrink-0 rounded-lg px-6 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00733d]", activeCategory === index ? "bg-[#009951] text-white" : "text-[#00733d] hover:bg-[#e6fdef]")}>
                  {category}
                </a>
              ))}
            </nav>
            {categories.map((category, index) => (
              <section key={category} id={`menu-category-${index}`} aria-labelledby={`menu-heading-${index}`} className="mt-8 scroll-mt-36">
                <h3 id={`menu-heading-${index}`} className="text-2xl font-bold text-[#2c2c2a]">{category}</h3>
                {categoryDescriptions[category] && <p className="mt-2 text-sm text-[#6b6b6b]">{categoryDescriptions[category]}</p>}
                <div className={cn("mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2", index === 0 && "lg:grid-cols-4")}>
                  {restaurant.products.filter((product) => product.category === category).map((product) => (
                    <Item key={product.id} {...product} restaurantName={restaurant.name} layout={index === 0 ? "vertical" : "horizontal"} />
                  ))}
                </div>
              </section>
            ))}
          </>
        ) : <p className="mt-8 text-[#545454]">Este restaurante todavía no tiene platos disponibles.</p>}
      </section>

      <aside role="note" className="mt-8 rounded-2xl border border-[#e8e8e8] bg-[#fcfffa] px-5 py-5">
        <p className="text-sm font-bold text-[#2c2c2a]">¿Tenés alguna alergia o restricción alimentaria?</p>
        <p className="mt-1 text-sm text-[#6b6b6b]">Antes de hacer tu pedido, consultá los ingredientes y la preparación con el restaurante. Las etiquetas de esta propuesta son orientativas.</p>
      </aside>
    </MainLayout>
  );
};

export default RestaurantDetail;
