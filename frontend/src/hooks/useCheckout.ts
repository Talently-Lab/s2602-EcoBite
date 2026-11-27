import { useQuery } from "@tanstack/react-query";
import { getDeliveryZones } from "@/services/checkout.service";

export const useDeliveryZones = () => useQuery({
  queryKey: ["zones"],
  queryFn: getDeliveryZones,
});
