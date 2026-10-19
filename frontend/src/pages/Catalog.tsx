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

const cuisineOptions = [
  { value: "saludable", label: "Comida saludable" },
  { value: "estacion", label: "Cocina de estación" },
  { value: "vegana", label: "Comida vegana" },
  { value: "casera", label: "Comida casera" },
];

const impactOptions = [
  { value: "eco-friendly", label: "Eco friendly" },
  { value: "bajo-carbono", label: "Bajo carbono" },
  { value: "local", label: "Local" },
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
  const [impact, setImpact] = useState<string | null>(null);
  const [zone, setZone] = useState<string | null>(null);

  return (
    <MainLayout>
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Restaurantes</h1>
        <p className="mt-2 text-muted-foreground">
          Encontrá restaurantes y conocé qué prácticas ambientales implementan.
        </p>

        <div className="mt-4">
          <label htmlFor="search" className="text-base font-medium text-foreground">
            Explorar opciones
          </label>
          <div className="relative mt-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
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
          <p className="mt-8 mb-3 text-base font-semibold text-foreground">Filtra por:</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="text-base text-muted-foreground">Tipo de comida</label>
              <Select value={cuisine} onValueChange={(v) => setCuisine(v)}>
                <SelectTrigger className="rounded-lg w-full mt-1">
                  <SelectValue placeholder="Selecciona aqui..." />
                </SelectTrigger>
                <SelectContent>
                  {cuisineOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-base text-muted-foreground">Impacto</label>
              <Select value={impact} onValueChange={(v) => setImpact(v)}>
                <SelectTrigger className="rounded-lg w-full mt-1">
                  <SelectValue placeholder="Selecciona aqui..." />
                </SelectTrigger>
                <SelectContent>
                  {impactOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-base text-muted-foreground">Zona</label>
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
          <h2 className="text-2xl font-normal tracking-tight">Restaurantes destacados</h2>

          {loading && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/50 p-6 text-center sm:flex-row sm:justify-between sm:text-left"
            >
              <p className="text-sm text-destructive">{error.message}</p>
              <Button type="button" onClick={() => refetch()} className="cursor-pointer">
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