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
          <h1 className="text-2xl font-normal leading-8 tracking-tight text-balance sm:text-3xl text-[#2C2C2A]">
            Pedí comida.
            <br />
            Generá menos impacto.
          </h1>
          <p className="mt-3 text-lg leading-6 text-[#545454] font-light sm:text-xl md:max-w-80">
            Restaurantes sustentables, platos deliciosos y un planeta más sano.
          </p>
          <Button
            type="button"
            onClick={() => navigate("/catalog")}
            className="mt-5 p-5 bg-[#009951]! text-[#FFFFFF]!"
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
      <section className="grid grid-cols-1 gap-6 divide-y my-10 divide-[#B5B5B5] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {FEATURES.map((feature) => (
          <div key={feature.id} className="flex flex-col items-center px-4 text-center py-6">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#04E762] text-[#003D29]">
              <feature.icon size={18} aria-hidden="true" className="fill-[#003D29]" />
            </span>
            <h2 className="mt-2 mb-3 text-lg max-w-37.5 font-bold leading-snug text-[#2C2C2A]">{feature.title}</h2>
            <p className="max-w-55 text-xs leading-relaxed text-[#2C2C2A]">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Restaurantes */}
      <section className="py-8">
        <h2 className="text-sm font-bold text-[#2C2C2A]">
          Encontrá restaurantes y conocé qué prácticas ambientales implementan.
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_RESTAURANTS.map((restaurant) => (
            <RestaurantCard
              key={restaurant.name}
              {...restaurant}
              onView={() => navigate(`/catalog/${restaurant.id}`)}
            />
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
