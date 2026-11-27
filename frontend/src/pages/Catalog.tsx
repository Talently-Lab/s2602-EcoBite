import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestaurants } from "@/hooks/useRestaurants";
import { MainLayout } from "@/pages/layout/MainLayout";

const categoryOptions = [
  "Comida saludable",
  "Comida de estación",
  "Comida vegana",
  "Comida casera",
];
const restaurantImages = [
  "/images/image-restaurant-02.webp",
  "/images/image-restaurant-03.webp",
  "/images/image-restaurant.webp",
  "/images/image-dish.webp",
];
const filterClass = "mt-1.5 w-full rounded-lg border-[#545454] px-4 text-sm shadow-none data-[size=default]:h-10";

const Catalog = () => {
  const { restaurants, loading, error, refetch } = useRestaurants();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es")) &&
      (!cuisine || cuisine === "Todos" || restaurant.category === cuisine) &&
      (!tag || tag === "Todas" || restaurant.isEco),
  );

  return (
    <MainLayout spacious>
      <section>
        <h1 className="text-[32px] font-bold leading-10 text-[#2c2c2a]">Restaurantes</h1>
        <p className="mt-2 text-xl leading-7 text-[#2c2c2a]">
          Encontrá restaurantes y comé saludable.
        </p>

        <div className="relative mt-8">
          <label htmlFor="restaurant-search" className="sr-only">Buscar restaurantes por nombre</label>
          <Search aria-hidden="true" className="pointer-events-none absolute top-3 left-4 size-4 text-[#8c8c8c]" />
          <Input id="restaurant-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Escribí acá..." className="h-10 rounded-lg border-[#545454] pl-10 text-sm placeholder:text-sm" />
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold text-[#2c2c2a]">Filtrá por:</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:w-[588px]">
            <div>
              <label htmlFor="filter-category" className="text-sm text-[#2c2c2a]">Categoría</label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger id="filter-category" className={filterClass}>
                  <SelectValue placeholder="Escribí acá..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas las categorías</SelectItem>
                  {categoryOptions.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="filter-tag" className="text-sm text-[#2c2c2a]">Etiqueta</label>
              <Select value={tag} onValueChange={setTag}>
                <SelectTrigger id="filter-tag" className={filterClass}>
                  <SelectValue placeholder="Escribí acá..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas las etiquetas</SelectItem>
                  <SelectItem value="Sustentable">Sustentable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-[26px] font-normal leading-8 text-[#2c2c2a]">Restaurantes destacados</h2>
          {loading && (
            <div role="status" aria-label="Cargando restaurantes" className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-90 animate-pulse rounded-2xl bg-[#2c2c2a]/10" />)}
            </div>
          )}
          {error && (
            <div role="alert" className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-[#aeacac] bg-white p-6 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-sm text-destructive">No pudimos cargar los restaurantes. Intentá nuevamente.</p>
              <Button type="button" onClick={() => refetch()} className="bg-[#009951]! text-white!">Reintentar</Button>
            </div>
          )}
          {!error && !loading && filteredRestaurants.length === 0 && (
            <p role="status" className="my-24 text-center text-sm text-[#545454]">No se encontraron restaurantes.</p>
          )}
          {!error && !loading && filteredRestaurants.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  name={restaurant.name}
                  description={restaurant.category}
                  isEco={restaurant.isEco}
                  featured
                  imageSrc={restaurantImages[restaurants.indexOf(restaurant) % restaurantImages.length]}
                  imageAlt="Imagen ilustrativa del restaurante"
                  onView={() => navigate(`/catalog/${restaurant.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Catalog;
