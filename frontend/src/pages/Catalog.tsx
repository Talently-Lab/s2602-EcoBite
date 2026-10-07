import { RestaurantCard } from "@/components/RestaurantCard"
import { Button } from "@/components/ui/button"
import { useRestaurants } from "@/hooks/useRestaurants"
import { MainLayout } from "@/pages/layout/MainLayout"
import type { AllRestaurants } from "@/types/restaurant"

const Catalog = () => {
  const { restaurants, loading, error, refetch } = useRestaurants();

  return (
    <MainLayout>
      <section>
        <h1 className="text-2xl font-bold tracking-tight">Restaurantes</h1>
        <p className="mt-1 text-muted-foreground">Encontrá opciones sustentables cerca tuyo.</p>

        {loading && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-border bg-muted/50 p-6 text-center sm:flex-row sm:justify-between sm:text-left"
          >
            <p className="text-sm text-destructive">{error.message}</p>
            <Button type="button" onClick={() => refetch()} className="cursor-pointer">
              Reintentar
            </Button>
          </div>
        )}

        {!error && !loading && restaurants.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">No hay restaurantes disponibles por ahora.</p>
        )}

        {!loading && restaurants.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((restaurant: AllRestaurants) => (
              <RestaurantCard key={restaurant.id ?? restaurant.name} {...restaurant} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  )
}

export default Catalog
