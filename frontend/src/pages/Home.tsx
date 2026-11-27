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
                description={restaurant.description?.trim() || restaurant.category}
                isEco={restaurant.isEco}
                tag={restaurant.tag}
                featured
                imageAlt={restaurant.imageUrl?.trim() ? restaurant.name : "Imagen ilustrativa del restaurante"}
                imageSrc={restaurant.imageUrl?.trim() || ["/images/image-restaurant-02.webp", "/images/image-restaurant-03.webp", "/images/image-restaurant.webp", "/images/image-dish.webp"][index]}
                onView={() => navigate(`/catalog/${restaurant.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="impact-method-title" className="mt-16 text-black">
        <h2 id="impact-method-title" className="text-[28px] font-normal leading-[1.2] sm:text-[32px]">
          ¿Cómo medimos tu impacto?
        </h2>
        <p className="text-lg font-bold leading-6 text-[#545454] sm:text-xl">
          Estimaciones de referencia pensadas para esta etapa y se van refinando a medida que sumamos mediciones reales
        </p>

        <div className="mt-6 grid divide-y divide-[#b5b5b5] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex min-h-[234px] flex-col items-center justify-center px-6 py-8 text-center">
            <h3 className="max-w-72 text-xl font-bold leading-6">
              Comparamos los materiales ecobite vs el envase tradicional
            </h3>
            <p className="mt-5 max-w-72 text-sm leading-4">
              Identificamos cuánto plástico o telgopor hubiera usado un envío convencional.
            </p>
          </div>
          <div className="flex min-h-[234px] flex-col items-center justify-center px-6 py-8 text-center">
            <h3 className="max-w-72 text-xl font-bold leading-6">
              Contabilizamos el plástico evitado:
            </h3>
            <p className="mt-5 max-w-72 text-sm leading-4">
              Reemplazamos esos materiales por opciones compostables o recicladas (como cartón kraft o bagazo de caña) para llegar a <strong>0 g</strong> de plástico por envase.
            </p>
          </div>
          <div className="flex min-h-[234px] flex-col items-center justify-center px-6 py-8 text-center">
            <h3 className="max-w-72 text-xl font-bold leading-6">
              Convertimos ese ahorro a su CO2 estimado:
            </h3>
            <p className="mt-5 max-w-72 text-sm leading-4 text-[#545454]">
              Convertimos el total de gramos de plástico evitados en tus pedidos en un estimado de las emisiones de CO2 que ahorraste.
            </p>
          </div>
        </div>

        <img
          src="/images/sustainable-packaging-delivery.png"
          alt="Preparación de un pedido con envases sustentables para su entrega"
          width={2400}
          height={496}
          loading="lazy"
          className="mt-14 h-auto w-full rounded-2xl"
        />
      </section>

      <section aria-labelledby="delivery-impact-title" className="mt-20 text-black">
        <img
          src="/images/sustainable-delivery-route.png"
          alt="Ilustración del seguimiento de un pedido en bicicleta desde el restaurante hasta su destino, con una llegada estimada de 15 minutos"
          width={2400}
          height={496}
          loading="lazy"
          className="h-auto w-full rounded-2xl"
        />
        <h2 id="delivery-impact-title" className="mt-10 text-[28px] font-normal leading-[1.2] text-[#545454] sm:text-[32px]">
          ¿Cómo calculamos el CO2 ahorrado y tu acumulado?
        </h2>
        <p className="text-lg font-bold leading-6 text-[#545454] sm:text-xl">
          Cada pedido repartido sin emisiones suma un ahorro real para el ambiente.
        </p>

        <div className="mx-auto mt-9 grid max-w-[680px] divide-y divide-[#b5b5b5] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="px-6 py-12 text-center">
            <h3 className="text-xl font-bold leading-6">Por pedido</h3>
            <p className="mt-5 text-sm leading-4">
              Estimamos el CO2 que ahorrás en cada pedido activo o completado según la distancia entre barrios (0,5 km en el mismo barrio), comparando nuestras entregas en bici o vehículo eléctrico frente a una moto a nafta.
            </p>
          </div>
          <div className="px-6 py-12 text-center">
            <h3 className="text-xl font-bold leading-6">Tu acumulado</h3>
            <p className="mt-5 text-sm leading-4">
              Es la suma en kilos de CO2 de todos tus pedidos en preparación o completados. Los pedidos cancelados no suman.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
