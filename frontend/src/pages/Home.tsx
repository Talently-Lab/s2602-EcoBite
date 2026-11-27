import { Bike, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/pages/layout/MainLayout";
import { RestaurantCard } from "@/components/RestaurantCard";
import { useRestaurants } from "@/hooks/useRestaurants";

const FEATURES = [
  {
    id: "packaging",
    icon: Leaf,
    title: "Envases 100% biodegradables",
    description: "Menos residuos y menor impacto ambiental.",
  },
  {
    id: "delivery",
    icon: Bike,
    title: "Envíos amigables con el ambiente",
    description: "Comida sana y sustentable.",
  },
  {
    id: "waste",
    icon: Leaf,
    title: "Comida sana y sustentable",
    description: "Menos residuos y menor impacto ambiental.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { restaurants, loading, error, refetch } = useRestaurants();

  return (
    <MainLayout spacious>
      {/* Hero */}
      <section className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,460fr)_minmax(0,690fr)] lg:gap-[50px]">
        <div className="flex w-full flex-col items-start">
          <h1 className="text-[28px] font-normal leading-[1.2] sm:text-[32px] text-[#2C2C2A]">
            Pedí comida.
            <br />
            Generá menos impacto.
          </h1>
          <p className="mt-4 max-w-[460px] text-lg leading-6 text-[#545454] sm:text-xl">
            Disfrutá platos ricos de restaurantes comprometidos con el ambiente. Elegí opciones sustentables y sumate al cambio.
          </p>
          <Button
            type="button"
            onClick={() => navigate("/auth?mode=register")}
            className="mt-10 h-10 whitespace-normal rounded-lg bg-[#009951]! px-6 text-sm font-bold text-[#FFFFFF]!"
          >
            Registrate y sumate al cambio
          </Button>
        </div>
        <picture>
          <source media="(min-width: 1024px)" srcSet="/images/image-home.webp" />
          <img
            src="/images/image-home-02.webp"
            alt="Persona disfrutando un plato sustentable"
            fetchPriority="high"
            className="h-60 w-full rounded-2xl object-cover lg:h-full lg:min-h-60"
          />
        </picture>
      </section>

      {/* Diferenciales */}
      <section className="my-10 grid grid-cols-1 divide-y divide-[#b5b5b5] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {FEATURES.map((feature) => (
          <div key={feature.id} className="flex min-h-[185px] flex-col items-center justify-center px-6 py-4 text-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#04E762] text-[#003D29]">
              <feature.icon size={22} className={feature.icon === Leaf ? "fill-current" : undefined} aria-hidden="true" />
            </span>
            <h2 className="mt-4 mb-4 max-w-72 text-xl font-bold leading-6 text-[#2C2C2A]">{feature.title}</h2>
            <p className="max-w-64 text-sm leading-[18px] text-[#2C2C2A]">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Restaurantes */}
      <section>
        <h2 className="text-sm font-bold leading-5 text-[#2C2C2A]">
          Encontrá restaurantes y conocé qué prácticas ambientales implementan.
        </h2>
        {loading && (
          <div className="mt-3.5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="text-sm text-destructive">No pudimos cargar los restaurantes. Intentá nuevamente.</p>
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
          <div className="mt-3.5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {restaurants.slice(0, 4).map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                name={restaurant.name}
                description={restaurant.category}
                isEco={restaurant.isEco}
                featured
                imageAlt={index === 3 ? "Plato de comida saludable" : "Personas compartiendo una comida en un restaurante"}
                imageSrc={["/images/image-restaurant-02.webp", "/images/image-restaurant-03.webp", "/images/image-restaurant.webp", "/images/image-dish.webp"][index]}
                onView={() => navigate(`/catalog/${restaurant.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default Home;
