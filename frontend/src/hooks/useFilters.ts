import { getZones } from "@/services/filters.service";
import { useQuery } from "@tanstack/react-query";

export const useZones = () => {
  const query = useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });

  return {
    ...query,
    zones: query.data ?? [],
    loading: query.isPending,
  };
};