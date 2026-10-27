import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/pages/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Item } from "@/components/Item";
import { useRestaurantById } from "@/hooks/useRestaurants";

const RestaurantDetail = () => {
  const { id } = useParams();
  const { restaurant, loading, error } = useRestaurantById(id ?? "");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");

  const typesMenus = Array.from(new Set(restaurant?.products.map((c) => c.category)))

  if (loading) return <MainLayout> loading... </MainLayout>;
  if (error || !restaurant) return <MainLayout> {error?.message} </MainLayout>;

  return (
    <MainLayout>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#6B6B6B]">
        <Link to="/catalog" className="transition-colors hover:text-[#009951] hover:underline">
          Restaurantes
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="font-semibold text-[#2C2C2A]">{restaurant?.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
        <img
          src="/images/image-restaurant-03.png"
          alt={`Interior de ${restaurant?.name}`}
          className="h-64 w-full rounded-lg object-cover md:h-72"
        />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2C2C2A]">
            {restaurant?.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-[#6B6B6B]">{restaurant?.category}</p>
          <p className="mt-2 text-lg text-[#2C2C2A]">
            Elegí tu próximo plato: bowls frescos, recetas de estación y algo dulce para terminar.
          </p>
          <span className="w-fit flex items-center gap-1 rounded-full bg-[#E6FDEF] text-[#009951] px-2 py-1 text-[11px] font-bold mt-6">
            <span className="h-2 w-2 rounded-full bg-[#FFFFFFCC] block" />
            {restaurant.isEco ? 'Eco Friendly' : ''}
          </span>
        </div>
      </div>

      <section className="mt-10 flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
            Menú de {restaurant?.name}
          </h2>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Conocé las prácticas ambientales verificadas de este local.
          </p>
        </div>
        <div className="w-full sm:w-fit lg:max-w-xs">
          <label htmlFor="menu-search" className="text-[13px] font-normal text-[#0A0D0A]">
            Etiqueta
          </label>
          <div className="relative mt-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8C8C8C]"
              aria-hidden="true"
            />
            <Input
              id="menu-search"
              type="search"
              placeholder="Escribe aquí..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 rounded-lg pl-10"
            />
          </div>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Categorías del menú">
          {typesMenus.map((type, i) => {
            const isActive = type === activeCategory;
            return (
              <Button
                key={i}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory((prev) => (prev === type ? "" : type))}
                className={cn(
                  "p-5",
                  isActive ? "bg-[#009951]! text-[#FFFFFF]!" : "bg-[#FFFFFF]! text-[#009951]!"
                )}
              >
                {type}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 border-b border-[#E8E8E8]" />
      {/* Sección vertical: visible si no hay selección o si es la categoría activa */}
      {(activeCategory === "" || activeCategory === typesMenus[0]) && (
        <>
          <div className="mt-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
              {typesMenus[0]}
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Color, frescura y buenos ingredientes en cada bocado.
            </p>
          </div>
          <div className="my-5 grid grid-cols-1 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-6">
            {restaurant.products
              .filter((pr) => pr.category === typesMenus[0])
              .map((pr) => (
                <Item key={pr.id} {...pr} tag={restaurant.isEco ? 'Eco Friendly' : ''} />
              ))}
          </div>
        </>
      )}
      {/* HORIZONTAL ITEMS: cada categoría restante con su encabezado (respetando el filtro de tabs) */}
      {typesMenus.slice(1)
        .filter((category) => activeCategory === "" || category === activeCategory)
        .map((category) => (
        <div key={category}>
          <div className="mt-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
              {category}
            </h2>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Recetas para disfrutar sin apuro.
            </p>
          </div>
          <div className="my-5 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-6">
            {restaurant.products
              .filter((pr) => pr.category === category)
              .map((pr) => (
                <Item key={pr.id} layout="horizontal" {...pr} tag={restaurant.isEco ? 'Eco Friendly' : ''} />
              ))}
          </div>
        </div>
      ))}
      <aside
        role="note"
        className="my-10 rounded-xl bg-[#FCFFFA] border border-[#E8E8E8] px-6 py-5"
      >
        <p className="text-sm font-bold text-[#2C2C2A]">
          ¿Tenés alguna alergia o restricción alimentaria?
        </p>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Antes de hacer tu pedido, consultá los ingredientes y la preparación con el restaurante. Las etiquetas de esta propuesta son orientativas.
        </p>
      </aside>
    </MainLayout>
  );
};

export default RestaurantDetail;
