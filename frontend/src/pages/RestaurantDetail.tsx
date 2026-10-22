import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/pages/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Item } from "@/components/Item";

const TYPES_MENU = [
  {
    id: 1,
    label: 'Bowls y ensaladas'
  },
  {
    id: 2,
    label: 'Platos principales'
  },
  {
    id: 3,
    label: 'Para acompañar'
  },
  {
    id: 4,
    label: 'Bebidas'
  }
]
const RestaurantDetail = () => {
  const { id } = useParams();
  console.log("ID", id)
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(TYPES_MENU[0].id);

  return (
    <MainLayout>
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#6B6B6B]">
        <Link to="/catalog" className="transition-colors hover:text-[#009951] hover:underline">
          Restaurantes
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="font-semibold text-[#2C2C2A]">La Huerta</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
        <img
          src="/images/image-restaurant-03.png"
          alt={`Interior de La Huerta`}
          className="h-64 w-full rounded-lg object-cover md:h-72"
        />
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2C2C2A]">
            La Huerta
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-[#6B6B6B]">Comida Saludable</p>
          <p className="mt-2 text-lg text-[#2C2C2A]">
            Elegí tu próximo plato: bowls frescos, recetas de estación y algo dulce para terminar.
          </p>
          <span className="w-fit flex items-center gap-1 rounded-full bg-[#E6FDEF] text-[#009951] px-2 py-1 text-[11px] font-bold mt-6">
            <span className="h-2 w-2 rounded-full bg-[#FFFFFFCC] block" />
            Eco friendly
          </span>
        </div>
      </div>

      <section className="mt-10 flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
            Menú de La Huerta
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
          {TYPES_MENU.map((category) => {
            const isActive = category.id === activeCategory;
            return (
              <Button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "p-5",
                  isActive ? "bg-[#009951]! text-[#FFFFFF]!" : "bg-[#FFFFFF]! text-[#009951]!"
                )}
              >
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 border-b border-[#E8E8E8]" />
      <div className="mt-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
          Bowls y ensaladas
        </h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Color, frescura y buenos ingredientes en cada bocado.
        </p>
      </div>
      <div className="my-5 grid grid-cols-1 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-6">
        <Item />
        <Item />
        <Item />
        <Item />
      </div>
      {/* HORIZONTAL ITEMS */}
      <div className="mt-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
          Platos principales
        </h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Recetas para disfrutar sin apuro.
        </p>
      </div>
      <div className="my-5 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-6">
        <Item layout="horizontal"/>
        <Item layout="horizontal"/>
        <Item layout="horizontal"/>
        <Item layout="horizontal"/>
      </div>
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
