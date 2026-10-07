import { useQuery } from "@tanstack/react-query";
import { getRestaurants } from "@/services/restaurants.service";

export const useRestaurants = () => {
  const query = useQuery({
    queryKey: ["restaurants"],
    queryFn: getRestaurants,
  });

  return {
    ...query,
    restaurants: query.data,
    loading: query.isPending,
  };
};
