import { useState } from "react";
import { Search } from "lucide-react";
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
import type { AllRestaurants } from "@/types/restaurant";

const categoryOptions = [
  { value: "saludable", label: "Comida saludable" },
  { value: "estacion", label: "Cocina de estación" },
  { value: "vegana", label: "Comida vegana" },
  { value: "casera", label: "Comida casera" },
];

const zoneOptions = [
  { value: "norte", label: "Zona Norte" },
  { value: "sur", label: "Zona Sur" },
  { value: "este", label: "Zona Este" },
  { value: "oeste", label: "Zona Oeste" },
  { value: "centro", label: "Centro" },
];

const Catalog = () => {
  const { restaurants, loading, error, refetch } = useRestaurants();
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [zone, setZone] = useState<string | null>(null);

  return (
    <MainLayout>
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-[#2C2C2A]">Restaurantes</h1>
        <p className="mt-1 text-[#2C2C2A]">
          Encontrá restaurantes y conocé qué prácticas ambientales implementan.
        </p>

        <div className="mt-4">
          <label htmlFor="search" className="text-[13px] font-normal text-[#0A0D0A]">
            Explorar opciones
          </label>
          <div className="relative mt-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8C8C8C]"
              aria-hidden="true"
            />
            <Input
              id="search"
              type="search"
              placeholder="Escribe aquí..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        </div>

        <div>
          <p className="mt-8 mb-3 text-[13px] font-semibold text-[#2C2C2A]">Filtra por:</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="text-[13px] text-[#0A0D0A]">Categoria</label>
              <Select value={cuisine} onValueChange={(v) => setCuisine(v)}>
                <SelectTrigger className="rounded-lg w-full mt-1">
                  <SelectValue placeholder="Selecciona aqui..." />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[13px] text-[#0A0D0A]">Zona</label>
              <Select value={zone} onValueChange={(v) => setZone(v)}>
                <SelectTrigger className="rounded-lg w-full mt-1">
                  <SelectValue placeholder="Selecciona aqui..." />
                </SelectTrigger>
                <SelectContent>
                  {zoneOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
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

          {!error && !loading && restaurants.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              No hay restaurantes disponibles por ahora.
            </p>
          )}

          {!loading && restaurants.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {restaurants.map((restaurant: AllRestaurants) => (
                <RestaurantCard key={restaurant.id ?? restaurant.name} {...restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Catalog;