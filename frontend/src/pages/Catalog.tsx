import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RestaurantCard } from "@/components/RestaurantCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useZones } from "@/hooks/useFilters";
import { MainLayout } from "@/pages/layout/MainLayout";

const categoryOptions = [
  { value: "COMIDA_SALUDABLE", label: "Comida saludable" },
  { value: "COMIDA_DE_ESTACION", label: "Cocina de estación" },
  { value: "COMIDA_VEGANA", label: "Comida vegana" },
  { value: "COMIDA_CASERA", label: "Comida casera" },
];

const Catalog = () => {
  const { restaurants, loading, error, refetch } = useRestaurants();
  const { zones } = useZones();
  const navigate = useNavigate();
  const [cuisine, setCuisine] = useState("Todos");
  const [zone, setZone] = useState("Todos");

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      (zone === "Todos" || restaurant.zone.name === zone) &&
      (cuisine === "Todos" || restaurant.category === cuisine),
  );

  return (
    <MainLayout>
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2A]">Restaurantes</h1>
        <p className="mt-1 text-[#2C2C2A]">
          Encontrá restaurantes y conocé qué prácticas ambientales implementan.
        </p>
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mt-4">
            <div>
              <label htmlFor="filter-category" className="text-[13px] text-[#0A0D0A]">
                Categoria
              </label>
              <Select
                value={cuisine}
                onValueChange={(value) => setCuisine(value ?? "Todos")}
              >
                <SelectTrigger id="filter-category" className="rounded-lg w-full mt-1">
                  <SelectValue placeholder="Selecciona aqui..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.label}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="filter-zone" className="text-[13px] text-[#0A0D0A]">
                Zona
              </label>
              <Select
                value={zone}
                onValueChange={(value) => setZone(value ?? "Todos")}
              >
                <SelectTrigger id="filter-zone" className="rounded-lg w-full mt-1">
                  <SelectValue placeholder="Selecciona aqui..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {zones.map((opt) => (
                    <SelectItem key={opt.id} value={opt.name}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-normal tracking-tight text-[#2C2C2A]">Restaurantes destacados</h2>

          {loading && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-[#2C2C2A]/30" />
              ))}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-[#AEACAC] bg-white p-6 text-center sm:flex-row sm:justify-between sm:text-left"
            >
              <p className="text-sm text-destructive">ERROR</p>
              <Button type="button" onClick={() => refetch()} className="cursor-pointer bg-[#009951]! text-[#FFFFFF]!">
                Reintentar
              </Button>
            </div>
          )}

          {!error && !loading && filteredRestaurants.length === 0 && (
            <p className="my-24 text-center text-sm text-[#545454]">
              No se encontraron restaurantes.
            </p>
          )}

          {!loading && filteredRestaurants.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  name={restaurant.name}
                  description={restaurant.category}
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