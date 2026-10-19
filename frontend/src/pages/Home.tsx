import { Bike, Leaf, Recycle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MOCK_RESTAURANTS } from "@/lib/mocks";
import { MainLayout } from "./layout/MainLayout";
import { RestaurantCard } from "@/components/RestaurantCard";

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
    title: "Envases 100% biodegradables",
    description: "Menos residuos y menor impacto ambiental.",
  },
  {
    id: "waste",
    icon: Recycle,
    title: "Envases 100% biodegradables",
    description: "Menos residuos y menor impacto ambiental.",
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero */}
      <section className="grid items-center gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-8 mt-3">
        <div className="w-full">
          <h1 className="text-2xl font-normal leading-8 tracking-tight text-balance sm:text-3xl text-muted-foreground">
            Pedí comida.
            <br />
            Generá menos impacto.
          </h1>
          <p className="mt-3 text-lg leading-6 text-secondary-foreground font-light sm:text-xl md:max-w-80">
            Restaurantes sustentables, platos deliciosos y un planeta más sano.
          </p>
          <Button
            type="button"
            onClick={() => navigate("/catalog")}
            className="mt-5"
          >
            Explorar Restaurantes
          </Button>
        </div>
        <picture>
          <source media="(min-width: 1024px)" srcSet="/images/image-home.png" />
          <img
            src="/images/image-home-02.png"
            alt="Persona disfrutando un plato sustentable"
            className="w-full rounded-2xl object-cover"
          />
        </picture>
      </section>

      {/* Diferenciales */}
      <section className="grid grid-cols-1 gap-6 py-8 divide-y divide-[#B5B5B5] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {FEATURES.map((feature) => (
          <div key={feature.id} className="flex flex-col items-center px-4 pb-12 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#04E762] text-primary-foreground">
              <feature.icon size={18} aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-sm font-bold leading-snug">{feature.title}</h2>
            <p className="mt-1 max-w-55 text-xs leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Restaurantes */}
      <section className="py-8">
        <h2 className="text-sm font-bold">
          Encontrá restaurantes y conocé qué prácticas ambientales implementan.
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_RESTAURANTS.map((restaurant) => (
            <RestaurantCard key={restaurant.name} {...restaurant} />
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
