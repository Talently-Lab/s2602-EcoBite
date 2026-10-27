import { useQuery } from "@tanstack/react-query";
import { getRestaurantById, getRestaurants } from "@/services/restaurants.service";

export const useRestaurants = () => {
  const query = useQuery({
    queryKey: ["restaurants"],
    queryFn: getRestaurants,
  });

  return {
    ...query,
    restaurants: query.data ?? [],
    loading: query.isPending,
  };
};

export const useRestaurantById = (id: string) => {
  const query = useQuery({
    queryKey: ["restaurants", "detail", id],
    queryFn: () => getRestaurantById(id),
    enabled: Boolean(id),
  });

  return {
    ...query,
    restaurant: query.data,
    loading: query.isPending,
  };
};
